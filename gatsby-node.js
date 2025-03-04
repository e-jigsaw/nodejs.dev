// Use in this file CommonJS syntax see https://www.gatsbyjs.org/docs/migrating-from-v1-to-v2/#convert-to-either-pure-commonjs-or-pure-es6
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const readingTime = require('reading-time');
const asyncMethods = require('async');
const createSlug = require('./util-node/createSlug');
const getNodeReleasesData = require('./util-node/getNodeReleasesData');
const getBannersData = require('./util-node/getBannersData');
const getNvmData = require('./util-node/getNvmData');
const createPagesQuery = require('./util-node/createPagesQuery');
const createLearnQuery = require('./util-node/createLearnQuery');
const createApiQuery = require('./util-node/createApiQuery');
const createMarkdownPages = require('./util-node/createMarkdownPages');
const createApiPages = require('./util-node/createApiPages');
const redirects = require('./redirects');
const nodeLocales = require('./locales');
const { learnPath, apiPath, blogPath } = require('./pathPrefixes');

const BLOG_POST_FILENAME_REGEX = /([0-9]+)-([0-9]+)-([0-9]+)-(.+)\.md$/;

const learnYamlNavigationData = yaml.parse(
  fs.readFileSync('./src/data/learn.yaml', 'utf8')
);

const apiTypesNavigationData = yaml.parse(
  fs.readFileSync('./src/data/apiTypes.yaml', 'utf8')
);

// This creates a map of all the locale JSONs that are enabled in the config.json file
const intlMessages = nodeLocales.locales.reduce((acc, locale) => {
  const filePath = path.resolve(
    __dirname,
    `./src/i18n/locales/${locale.code}.json`
  );
  acc[locale.code] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return acc;
}, {});

const getMessagesForLocale = locale =>
  locale && locale in intlMessages
    ? intlMessages[locale]
    : intlMessages[nodeLocales.defaultLanguage];

const getRedirectForLocale = (locale, url) =>
  /^\/\/|https?:\/\//.test(url) ? url : `/${locale}${url}`;

exports.onCreateWebpackConfig = ({ plugins, actions }) => {
  actions.setWebpackConfig({
    plugins: [
      plugins.ignore({ resourceRegExp: /canvas/, contextRegExp: /jsdom$/ }),
    ],
  });
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  const typeDefs = `
    type BannersIndex implements Node {
      endDate: String
      link: String
      text: String
      html: String
      startDate: String
    }
  `;

  createTypes(typeDefs);
};

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage, createRedirect } = actions;

  const pageRedirects = { ...redirects };

  const apiTemplate = path.resolve(__dirname, './src/templates/api.tsx');
  const learnTemplate = path.resolve(__dirname, './src/templates/learn.tsx');
  const blogTemplate = path.resolve(__dirname, './src/templates/blog.tsx');
  const blogCategoryTemplate = path.resolve(
    __dirname,
    './src/templates/blog-category.tsx'
  );

  const [learnResult, pagesResult, apiResult] = await Promise.all([
    graphql(createLearnQuery),
    graphql(createPagesQuery),
    graphql(createApiQuery),
  ]);

  if (pagesResult.errors || learnResult.errors || apiResult.errors) {
    reporter.panicOnBuild('Error while running GraphQL queries.');
    return;
  }

  const {
    pages: { edges: pageEdges },
    categories: { edges: categoryEdges },
  } = pagesResult.data;

  const {
    allMdx: { edges: learnEdges },
  } = learnResult.data;

  const {
    pages: { edges: apiEdges },
    nodeReleases: { nodeReleasesVersion },
  } = apiResult.data;

  const {
    markdownPages,
    learnPages,
    firstLearnPage,
    navigationData: learNavigationData,
  } = createMarkdownPages(pageEdges, learnEdges, learnYamlNavigationData);

  const {
    apiPages,
    latestVersion,
    navigationData: apiNavigationData,
    defaultNavigationRedirects: apiRedirects,
  } = createApiPages(apiEdges, apiTypesNavigationData, nodeReleasesVersion);

  if (firstLearnPage) {
    createPage({
      path: learnPath,
      component: learnTemplate,
      context: { ...firstLearnPage, navigationData: learNavigationData },
    });
  }

  learnPages.forEach(page => {
    createPage({
      path: page.slug,
      component: learnTemplate,
      context: { ...page, navigationData: learNavigationData },
    });
  });

  categoryEdges.forEach(({ node }) => {
    createPage({
      path: `${blogPath}${node.name}/`,
      component: blogCategoryTemplate,
      context: { categoryName: node.name },
    });
  });

  const latestApiPath = `${apiPath}${latestVersion}/`;

  pageRedirects[apiPath] = `${latestApiPath}documentation/`;
  pageRedirects[latestApiPath] = `${latestApiPath}documentation/`;

  apiRedirects.forEach(({ from, to }) => {
    pageRedirects[`${apiPath}${from}`] = `${apiPath}${to}`;

    // Redirects from the old API URL schema (Nodejs.org)
    // To the new URL schema
    pageRedirects[`${apiPath}${from.slice(0, -1)}.html`] = `${apiPath}${to}`;
  });

  apiPages.forEach(page => {
    createPage({
      path: page.slug,
      component: apiTemplate,
      context: { ...page, navigationData: apiNavigationData[page.version] },
    });
  });

  markdownPages
    .filter(page => page.realPath.match(blogPath))
    .forEach(page => {
      // Blog Pages don't necessary need to be within the `blog` category
      // But actually inside /content/blog/ section of the repository
      createPage({
        path: page.slug,
        component: blogTemplate,
        context: page,
      });
    });

  // Create Redirects for Pages
  Object.keys(pageRedirects).forEach(from => {
    const metadata = {
      fromPath: from,
      toPath: pageRedirects[from],
      isPermanent: true,
      redirectInBrowser: true,
      statusCode: 200,
    };

    createRedirect(metadata);

    // Creates Redirects for Locales
    nodeLocales.locales.forEach(({ code }) =>
      createRedirect({
        ...metadata,
        fromPath: getRedirectForLocale(code, metadata.fromPath),
        toPath: getRedirectForLocale(code, metadata.toPath),
      })
    );
  });
};

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions;

  // Deletes the same page that is created by the createPage action
  deletePage(page);

  // Recreates the page with the messages that ReactIntl needs
  // This will be passed to the ReactIntlProvider Component
  // Used within gatsby-browser.js and gatsby-ssr.js
  createPage({
    ...page,
    context: {
      ...page.context,
      intlMessages: getMessagesForLocale(page.context.locale),
      locale: page.context.locale || nodeLocales.defaultLanguage,
    },
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  if (node.internal.type === 'Mdx') {
    const { createNodeField } = actions;
    const { fileAbsolutePath, parent, frontmatter } = node;

    const relativePath =
      parent && getNode(parent) ? getNode(parent).relativePath : '';

    let slug;

    if (fileAbsolutePath) {
      // Special Handling for Blog Posts
      if (fileAbsolutePath.includes(blogPath)) {
        const [, year, month, day, filename] =
          BLOG_POST_FILENAME_REGEX.exec(relativePath);

        slug = blogPath;

        if (frontmatter.category) {
          slug += `${frontmatter.category}/`;
        }

        slug += `${year}/${month}/${day}/${filename}`;

        const date = new Date(year, month - 1, day);

        createNodeField({
          node,
          name: 'date',
          value: date.toJSON(),
        });

        createNodeField({
          node,
          name: `readingTime`,
          value: readingTime(node.rawBody),
        });
      }

      if (frontmatter.category === 'learn') {
        // Different type of slug for /learn/ pages
        slug = `${learnPath}${createSlug(frontmatter.title)}/`;
      }

      if (frontmatter.category === 'api') {
        // Different type of slug for /api/ pages
        slug = `${apiPath}${frontmatter.version}/${frontmatter.title}/`;
      }
    }

    createNodeField({
      node,
      name: 'slug',
      value: slug || createSlug(frontmatter.title),
    });

    if (frontmatter.authors) {
      createNodeField({
        node,
        name: 'authors',
        value: frontmatter.authors.split(','),
      });
    }

    if (frontmatter.category) {
      createNodeField({
        node,
        name: 'categoryName',
        value: frontmatter.category,
      });
    }
  }
};

exports.sourceNodes = async ({
  reporter: { activityTimer },
  actions: { createNode },
  createContentDigest,
  createNodeId,
}) => {
  const [releaseTimer, bannersTimer, nvmTimer] = [
    activityTimer('Fetching Node release data'),
    activityTimer('Fetching Banners data'),
    activityTimer('Fetching latest NVM version data'),
  ];

  await asyncMethods.parallel([
    callback => {
      bannersTimer.start();

      getBannersData().then(bannersData => {
        const bannersMeta = {
          id: createNodeId('banners'),
          parent: null,
          children: [],
          internal: {
            type: 'Banners',
            mediaType: 'application/json',
            content: JSON.stringify(bannersData),
            contentDigest: createContentDigest(bannersData),
          },
        };

        createNode({ ...bannersData, ...bannersMeta }).then(() => {
          bannersTimer.end();

          callback();
        });
      });
    },
    callback => {
      nvmTimer.start();

      getNvmData().then(nvmData => {
        const nvmMeta = {
          id: createNodeId('nvm'),
          parent: null,
          children: [],
          internal: {
            type: 'Nvm',
            mediaType: 'application/json',
            content: JSON.stringify(nvmData),
            contentDigest: createContentDigest(nvmData),
          },
        };

        createNode({ ...nvmData, ...nvmMeta }).then(() => {
          nvmTimer.end();

          callback();
        });
      });
    },
    callback => {
      releaseTimer.start();

      getNodeReleasesData(nodeReleasesData => {
        const nodeReleasesMeta = {
          id: createNodeId('node-releases'),
          parent: null,
          children: [],
          internal: {
            type: 'NodeReleases',
            mediaType: 'application/json',
            content: JSON.stringify(nodeReleasesData),
            contentDigest: createContentDigest(nodeReleasesData),
          },
        };

        createNode({ ...nodeReleasesData, ...nodeReleasesMeta }).then(() => {
          releaseTimer.end();

          callback();
        });
      });
    },
  ]);
};

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelOptions({
    options: {
      generatorOpts: {
        compact: true,
        comments: false,
      },
    },
  });
};
