const QueryString = require('querystring');
const formatNumber = require('format-number')();
const Pagination = require('../pagination');

module.exports = (params, results, config) => {
  config = config || {};

  const rootUrl = config.rootUrl || '';

  const data = {
    title: 'Search Results',
    page: results.data.length ? 'search' : 'noresults',
    q: params.q,
    results: results.data.map(createResult),
    pagination: createPagination(params, results, rootUrl),
    filters: results.meta.filters,
    links: {
      filterAll: createTypeFilterLink(null, params, rootUrl),
      filterObjects: createTypeFilterLink('objects', params, rootUrl),
      filterPeople: createTypeFilterLink('people', params, rootUrl),
      filterDocuments: createTypeFilterLink('documents', params, rootUrl)
    }
  };

  if (params['filter[type]']) {
    if (params['filter[type]'] === 'objects') {
      data.isFilterObjects = true;
    } else if (params['filter[type]'] === 'people') {
      data.isFilterPeople = true;
    } else if (params['filter[type]'] === 'documents') {
      data.isFilterDocuments = true;
    } else {
      data.isFilterAll = true;
    }
  } else {
    data.isFilterAll = true;
  }

  return data;
};

function createResult (item) {
  return {
    type: item.type,
    title: getTitle(item),
    description: getDescription(item),
    figure: getFigure(item),
    figcaption: getFigCaption(item),
    link: item.links && item.links.self
  };
}

function getTitle (item) {
  return item.attributes.summary_title || getPrimaryValue(item.attributes.title);
}

function getDescription (item) {
  return getPrimaryValue(item.attributes.description);
}

function getFigure (item) {
  if (item.type === 'documents') return '/assets/img/archive.svg';
  return null; // No images in index yet
}

function getFigCaption (item) {
  return getPrimaryValue(item.attributes.description) || getPrimaryValue(item.attributes.title) || item.attributes.summary_title;
}

function getPrimaryValue (array) {
  if (Object.prototype.toString.call(array) === '[object String]') {
    return array;
  }

  if (!Array.isArray(array) || !array.length) {
    return null;
  }

  const primary = array.find((d) => d.primary);
  return primary ? primary.value : array[0].value;
}

function createPagination (params, results, rootUrl) {
  const pageNumber = params['page[number]'] || 0;
  const pageSize = params['page[size]'] || 50;

  const pages = Pagination.pages(
    pageNumber,
    results.meta.total_pages,
    {
      createPageLink: (page) => {
        page.pageNumberDisplay = formatNumber(page.pageNumber + 1);
        const pageParams = Object.assign({}, params, { 'page[number]': page.pageNumber });
        return `${rootUrl}/search?${QueryString.stringify(pageParams)}`;
      }
    }
  );

  return {
    totalPages: results.meta.total_pages,
    pageNumber: pageNumber + 1,
    isFirst: pageNumber === 0,
    isLast: pageNumber === results.meta.total_pages - 1,
    isPageSize50: pageSize === 50,
    isPageSize100: pageSize === 100,
    links: Object.assign({}, results.links, { pages })
  };
}

function createTypeFilterLink (type, params, rootUrl) {
  params = Object.assign({}, params);
  delete params['filter[type]'];
  type = type ? '/' + type : '';
  return `${rootUrl}/search${type}?${QueryString.stringify(params)}`;
}
