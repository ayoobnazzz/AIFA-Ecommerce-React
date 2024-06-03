import { useLayoutEffect } from 'react';

const useDocumentTitle = (title) => {
  useLayoutEffect(() => {
    if (title) {
      document.title = title;
    } else {
      document.title = 'AIFA - Baby Cloud';
    }
  }, [title]);
};

export default useDocumentTitle;
