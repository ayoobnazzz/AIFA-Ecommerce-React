/* eslint-disable react/no-array-index-key */
import { SearchOutlined } from '@ant-design/icons';
import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { clearRecentSearch, removeSelectedRecent } from '@/redux/actions/filterActions';

const SearchBar = ({ initialValue = '' }) => {
  const [searchInput, setSearchInput] = useState(initialValue);
  const { filter, isLoading } = useSelector((state) => ({
    filter: state.filter,
    isLoading: state.app.loading
  }));
  const searchbarRef = useRef(null);
  const history = useHistory();

  const dispatch = useDispatch();
  const isMobile = window.screen.width <= 800;

  const onSearchChange = (e) => {
    const val = e.target.value.trimStart();
    setSearchInput(val);
  };

  useEffect(() => {
    setSearchInput(initialValue);
  }, [initialValue]);

  const onKeyUp = (e) => {
    if (e.keyCode === 13) {
      const searchTerm = searchInput.trim();
      if (searchTerm) {
        history.push(`/search/${encodeURIComponent(searchTerm.toLowerCase())}`);
      } else {
        history.push('/');
      }
    }
  };

  const recentSearchClickHandler = (e) => {
    const searchBar = e.target.closest('.searchbar');

    if (!searchBar) {
      searchbarRef.current.classList.remove('is-open-recent-search');
      document.removeEventListener('click', recentSearchClickHandler);
    }
  };

  const onFocusInput = (e) => {
    e.target.select();

    if (filter.recent.length !== 0) {
      searchbarRef.current.classList.add('is-open-recent-search');
      document.addEventListener('click', recentSearchClickHandler);
    }
  };

  const onClickRecentSearch = (keyword) => {
    // dispatch(setTextFilter(keyword));
    searchbarRef.current.classList.remove('is-open-recent-search');
    history.push(`/search/${keyword.trim().toLowerCase()}`);
  };

  const onClearRecent = () => {
    dispatch(clearRecentSearch());
  };

  return (
    <>
      <div className="searchbar" ref={searchbarRef}>
        <SearchOutlined className="searchbar-icon" />
        <input
          className="search-input searchbar-input"
          onChange={onSearchChange}
          onKeyUp={onKeyUp}
          onFocus={onFocusInput}
          placeholder="Search product..."
          readOnly={isLoading}
          type="text"
          value={searchInput}
        />
        {filter.recent.length !== 0 && (
          <div className="searchbar-recent">
            <div className="searchbar-recent-header">
              <h5>Recent Search</h5>
              <h5
                className="searchbar-recent-clear text-subtle"
                onClick={onClearRecent}
                role="presentation"
              >
                Clear
              </h5>
            </div>
            {filter.recent.map((item, index) => (
              <div
                className="searchbar-recent-wrapper"
                key={`search-${item}-${index}`}
              >
                <h5
                  className="searchbar-recent-keyword margin-0"
                  onClick={() => onClickRecentSearch(item)}
                  role="presentation"
                >
                  {item}
                </h5>
                <span
                  className="searchbar-recent-button text-subtle"
                  onClick={() => dispatch(removeSelectedRecent(item))}
                  role="presentation"
                >
                  X
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;
