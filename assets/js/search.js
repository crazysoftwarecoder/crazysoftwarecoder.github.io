(function() {
  let searchData = [];
  let searchInput;
  let searchResults;
  let noResults;
  let initialMessage;
  let searchTitles;
  let searchContent;
  let searchTags;

  function init() {
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');
    noResults = document.getElementById('no-results');
    initialMessage = document.getElementById('initial-message');
    searchTitles = document.getElementById('search-titles');
    searchContent = document.getElementById('search-content');
    searchTags = document.getElementById('search-tags');

    if (!searchInput) return;

    loadSearchData();
    bindEvents();
  }

  function loadSearchData() {
    fetch('/search.json')
      .then(response => response.json())
      .then(data => {
        searchData = data;
      })
      .catch(error => {
        console.error('Error loading search data:', error);
      });
  }

  function bindEvents() {
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Escape') {
        clearSearch();
      }
    });

    [searchTitles, searchContent, searchTags].forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        if (searchInput.value.trim()) {
          handleSearch();
        }
      });
    });
  }

  function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      showInitialMessage();
      return;
    }

    const results = performSearch(query);
    displayResults(results, query);
  }

  function performSearch(query) {
    const terms = query.split(/\s+/);

    return searchData.filter(post => {
      return terms.every(term => {
        let found = false;

        if (searchTitles.checked && post.title.toLowerCase().includes(term)) {
          found = true;
        }

        if (searchContent.checked && (
          post.content.toLowerCase().includes(term) ||
          post.excerpt.toLowerCase().includes(term)
        )) {
          found = true;
        }

        if (searchTags.checked && post.tags.some(tag =>
          tag.toLowerCase().includes(term)
        )) {
          found = true;
        }

        return found;
      });
    });
  }

  function displayResults(results, query) {
    hideAllMessages();

    if (results.length === 0) {
      showNoResults();
      return;
    }

    const resultsHtml = results.map(post => createPostCard(post, query)).join('');
    searchResults.innerHTML = `
      <div class="search-results-header">
        <h3>Found ${results.length} post${results.length === 1 ? '' : 's'}</h3>
      </div>
      <div class="posts-grid">
        ${resultsHtml}
      </div>
    `;
  }

  function createPostCard(post, query) {
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const highlightedTitle = highlightText(post.title, query);
    const highlightedExcerpt = highlightText(post.excerpt, query);

    const tagsHtml = post.tags.map(tag =>
      `<span class="tag">${highlightText(tag, query)}</span>`
    ).join('');

    return `
      <article class="post-card search-result">
        <div class="post-meta">
          <time class="post-date">${formattedDate}</time>
          ${post.tags.length > 0 ? `<div class="post-tags">${tagsHtml}</div>` : ''}
        </div>

        <h3 class="post-title">
          <a href="${post.url}">${highlightedTitle}</a>
        </h3>

        <div class="post-excerpt">
          ${highlightedExcerpt}
        </div>

        <div class="post-footer">
          <a href="${post.url}" class="read-more">
            Read More
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
            </svg>
          </a>
        </div>
      </article>
    `;
  }

  function highlightText(text, query) {
    if (!query) return text;

    const terms = query.split(/\s+/);
    let highlightedText = text;

    terms.forEach(term => {
      const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });

    return highlightedText;
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function showInitialMessage() {
    hideAllMessages();
    initialMessage.classList.remove('hidden');
  }

  function showNoResults() {
    hideAllMessages();
    noResults.classList.remove('hidden');
  }

  function hideAllMessages() {
    searchResults.innerHTML = '';
    noResults.classList.add('hidden');
    initialMessage.classList.add('hidden');
  }

  function clearSearch() {
    searchInput.value = '';
    showInitialMessage();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();