const { handler, generateUrlSlug } = require('./fetch.js');

// Mock the contentful library
const mockGetEntries = jest.fn();
const mockGetEntry = jest.fn();
jest.mock('contentful', () => ({
  createClient: jest.fn(() => ({
    getEntries: mockGetEntries,
    getEntry: mockGetEntry,
  })),
}));

// Store original process.env
const originalEnv = process.env;

describe('Netlify Function: fetch', () => {
  beforeEach(() => {
    // Reset mocks and environment variables before each test
    jest.resetModules();
    mockGetEntries.mockReset();
    mockGetEntry.mockReset();
    process.env = { ...originalEnv };
    process.env.SPACE_ID = 'test-space-id';
    process.env.CONTENTFUL_ACCESS_TOKEN = 'test-access-token';
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('Configuration and Input Validation', () => {
    it('should return 500 if space ID is missing', async () => {
      delete process.env.SPACE_ID;
      const event = { body: JSON.stringify({ type: 'article' }) };
      const response = await handler(event);
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).error).toBe('Missing Contentful space ID or access token');
    });

    it('should return 500 if access token is missing', async () => {
      delete process.env.CONTENTFUL_ACCESS_TOKEN;
      const event = { body: JSON.stringify({ type: 'article' }) };
      const response = await handler(event);
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).error).toBe('Missing Contentful space ID or access token');
    });

    it('should return 400 if content type is missing in the request body', async () => {
      const event = { body: JSON.stringify({ id: 'some-id' }) }; // No 'type'
      const response = await handler(event);
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toBe('Missing content type in request');
    });

    it('should return 500 for invalid JSON in request body', async () => {
        const event = { body: 'not-a-valid-json' };
        const response = await handler(event);
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error).toBe('Failed to fetch articles');
    });
  });

  describe('Fetching Multiple Entries', () => {
    const sampleEntries = {
        items: [
          {
            sys: { id: 'entry1' },
            fields: {
              title: 'Sample Title 1',
              authorId: 'author1',
              authorImage: { fields: { file: { url: '//images.ctfassets.net/author1.jpg' } } },
              authorName: 'John Doe',
              dateCreate: '2023-01-01T00:00:00Z',
              image: { fields: { file: { url: '//images.ctfassets.net/image1.jpg' } } },
              introduction: 'Intro 1',
              content: 'Content 1',
              tags: ['tag1', 'tag2'],
            },
          },
          {
            sys: { id: 'entry2' },
            fields: {
              title: 'Sample Title 2!',
              authorId: 'author2',
              authorImage: null,
              authorName: 'Jane Doe',
              dateCreate: '2023-01-02T00:00:00Z',
              image: null,
              introduction: 'Intro 2',
              content: 'Content 2',
              tags: ['tag3'],
            },
          },
        ],
      };

    it('should fetch and format multiple entries successfully', async () => {
        mockGetEntries.mockResolvedValue(sampleEntries);
        const event = { body: JSON.stringify({ type: 'article' }) };
        const response = await handler(event);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(200);
        expect(body.exists).toBe(true);
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBe(2);

        // Check first article mapping
        expect(body.articles[0].title).toBe('Sample Title 1');
        expect(body.articles[0].urlSlug).toBe('sample-title-1');
        expect(body.articles[0].author.authorName).toBe('John Doe');
        expect(body.articles[0].image).toBe('//images.ctfassets.net/image1.jpg');
        
        // Check second article mapping (with nulls)
        expect(body.articles[1].title).toBe('Sample Title 2!');
        expect(body.articles[1].urlSlug).toBe('sample-title-2');
        expect(body.articles[1].author.authorImage).toBeUndefined();
        expect(body.articles[1].image).toBeUndefined();
    });

    it('should return 404 if no entries are found', async () => {
        mockGetEntries.mockResolvedValue({ items: [] });
        const event = { body: JSON.stringify({ type: 'non-existent-type' }) };
        const response = await handler(event);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(404);
        expect(body.exists).toBe(false);
    });
  });

  describe('Fetching Single Entry', () => {
    const sampleEntry = {
        sys: { id: 'entry1' },
        fields: {
          title: 'A Single, Great Article',
          authorId: 'author1',
          authorImage: { fields: { file: { url: '//images.ctfassets.net/author1.jpg' } } },
          authorName: 'John Doe',
          dateCreate: '2023-01-01T00:00:00Z',
          image: { fields: { file: { url: '//images.ctfassets.net/image1.jpg' } } },
          introduction: 'Intro 1',
          content: 'Content 1',
          tags: ['tag1', 'tag2'],
        },
      };

    it('should fetch and format a single entry successfully', async () => {
        mockGetEntry.mockResolvedValue(sampleEntry);
        const event = { body: JSON.stringify({ type: 'article', id: 'entry1' }) };
        const response = await handler(event);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(200);
        expect(body.exists).toBe(true);
        expect(typeof body.articles).toBe('object');
        expect(Array.isArray(body.articles)).toBe(false);

        expect(body.articles.title).toBe('A Single, Great Article');
        expect(body.articles.urlSlug).toBe('a-single-great-article');
        expect(body.articles.author.authorName).toBe('John Doe');
        expect(body.articles.image).toBe('//images.ctfassets.net/image1.jpg');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 if contentful client throws an error', async () => {
        const errorMessage = 'Contentful is down';
        mockGetEntries.mockRejectedValue(new Error(errorMessage));
        const event = { body: JSON.stringify({ type: 'article' }) };
        const response = await handler(event);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(500);
        expect(body.error).toBe('Failed to fetch articles');
    });
  });
});

describe('Helper Function: generateUrlSlug', () => {
    it('should convert title to a URL-friendly slug', () => {
        const title = 'This is a Test Title!';
        expect(generateUrlSlug(title)).toBe('this-is-a-test-title');
    });

    it('should handle multiple spaces and hyphens', () => {
        const title = '  leading & trailing spaces -- and --- multiple hyphens  ';
        expect(generateUrlSlug(title)).toBe('leading-trailing-spaces-and-multiple-hyphens');
    });

    it('should remove special characters', () => {
        const title = 'Title with @!#$%^&*() characters';
        expect(generateUrlSlug(title)).toBe('title-with-characters');
    });

    it('should handle empty strings', () => {
        const title = '';
        expect(generateUrlSlug(title)).toBe('');
    });

    it('should handle titles that are only special characters', () => {
        const title = '!@#$%^&*()';
        expect(generateUrlSlug(title)).toBe('');
    });

    it('should not have leading or trailing hyphens', () => {
        const title = '-A title with hyphens-';
        expect(generateUrlSlug(title)).toBe('a-title-with-hyphens');
    });
});