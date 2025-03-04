import {
  PaginationInfo,
  LearnPageContext,
  NavigationSectionData,
  BlogPosts,
  BlogPageData,
  BlogPageContext,
  ArticleProps,
  NodeReleaseData,
  PageTableOfContents,
  BlogCategories,
} from '../types';
import mockMDXBodyContent from './mockMDXBodyContent';

export const mockTableOfContents: PageTableOfContents = {
  items: [
    { title: 'mock-title', url: '#mock-title' },
    { title: 'mock-title-2', url: '#mock-title-2' },
  ],
};

export const createPaginationInfo = (): PaginationInfo =>
  ({
    slug: 'test-slug',
    title: 'test-title',
  } as PaginationInfo);

export const createNavigationSectionData = (): NavigationSectionData =>
  ({
    'test-section': {
      data: [
        {
          slug: 'test-slug-1',
          title: 'test-title-1',
          category: 'test1',
        },
        {
          title: 'test-title-2',
          slug: 'test-slug-2',
          category: 'test1',
        },
      ],
      category: 'test1',
    },
    'test-section2': {
      data: [
        {
          slug: 'test-slug-3',
          title: 'test-title-3',
          category: 'test2',
        },
        {
          title: 'test-title-4',
          slug: 'test-slug-4',
          category: 'test2',
        },
      ],
      category: 'test2',
    },
  } as NavigationSectionData);

export const createLearnPageData = (): ArticleProps => ({
  data: {
    articleCurrentLanguage: {
      body: mockMDXBodyContent,
      tableOfContents: mockTableOfContents,
      frontmatter: {
        title: 'test-title',
        description: 'test-description',
      },
      fields: {
        authors: ['test-user1', 'test-user2'],
      },
    },
  },
});

export const createNodeReleasesData = (): NodeReleaseData[] =>
  [
    {
      endOfLife: '2022-04-30',
      ltsStart: '2019-10-21',
      maintenanceStart: '2020-11-30',
      initialRelease: '2019-04-23',
      codename: 'erbium',
      version: 'v12',
      fullVersion: 'v12.0.0',
      status: 'Maintenance LTS',
      isLts: false,
    },
    {
      endOfLife: '2023-04-30',
      ltsStart: '2020-10-17',
      maintenanceStart: '2021-10-19',
      initialRelease: '2020-04-21',
      codename: 'fermium',
      version: 'v14',
      fullVersion: 'v14.0.0',
      status: 'Active LTS',
      isLts: true,
    },
    {
      endOfLife: '2025-04-30',
      ltsStart: '2022-10-25',
      maintenanceStart: '2023-10-18',
      initialRelease: '2022-04-19',
      codename: 'v18',
      version: 'v18',
      fullVersion: 'v18.0.0',
      status: 'Current',
      isLts: false,
    },
  ] as NodeReleaseData[];

export const createLearnPageContext = (): LearnPageContext =>
  ({
    slug: 'test-slug',
    relativePath: 'test-path',
    next: createPaginationInfo(),
    previous: createPaginationInfo(),
    navigationData: createNavigationSectionData(),
  } as LearnPageContext);

export const createBlogPageContext = (): BlogPageContext => ({
  slug: 'test-slug',
  relativePath: 'test-path',
  next: createPaginationInfo(),
  previous: createPaginationInfo(),
  navigationData: createNavigationSectionData(),
});

export const createBlogData = (): {
  posts: BlogPosts;
  categories: BlogCategories;
} => ({
  posts: {
    edges: [
      {
        node: {
          frontmatter: {
            title: 'Mock blog title',
            category: {
              name: 'mock-category',
              slug: 'Mock Category Slug',
            },
            blogAuthors: [
              {
                name: 'Mock author name',
                website: 'Mock URL',
              },
            ],
          },
          fields: {
            date: '11/11/2022',
            slug: 'Mock blog slug',
            readingTime: {
              text: '1 min read',
            },
          },
        },
      },
    ],
  },
  categories: {
    edges: [],
  },
});

export const createBlogPageData = (): BlogPageData => ({
  blog: {
    body: mockMDXBodyContent,
    excerpt: 'excerpt-mock',
    frontmatter: {
      title: 't,itle-mock',
      blogAuthors: [
        {
          id: 'id-mock',
          name: 'name-mock',
          website: 'url-mock',
        },
      ],
    },
    fields: { slug: 'slug-mock', date: '11/11/2022' },
  },
  recent: {
    edges: [
      {
        node: {
          frontmatter: {
            title: 'title-mock',
            category: {
              name: 'category-mock',
              slug: 'category-mock-slug',
            },
            blogAuthors: [
              {
                id: 'id-mock',
                name: 'name-mock',
                website: 'url-mock',
              },
            ],
          },
          fields: {
            date: '11/11/2022',
            slug: 'slug-mock',
            readingTime: { text: 'text-mock' },
          },
        },
      },
    ],
  },
});

export const createGeneralPageData = (): ArticleProps => ({
  data: {
    articleCurrentLanguage: {
      fields: {
        authors: ['author-mock'],
      },
      frontmatter: {
        description: 'Mock Description',
        title: 'Mock Title',
      },
      body: mockMDXBodyContent,
      tableOfContents: mockTableOfContents,
    },
  },
});

export const createResourcesData = (): ArticleProps => ({
  data: {
    articleCurrentLanguage: {
      fields: {
        authors: ['MrJithil'],
      },
      frontmatter: {
        description: 'Mock Description',
        title: 'Mock Title',
      },
      body: mockMDXBodyContent,
      tableOfContents: mockTableOfContents,
    },
  },
});

export const createPrivacyData = (): ArticleProps => ({
  data: {
    articleCurrentLanguage: {
      fields: {
        authors: ['Author'],
      },
      frontmatter: {
        description: 'Description',
        title: 'Title',
      },
      body: mockMDXBodyContent,
      tableOfContents: mockTableOfContents,
    },
  },
});
