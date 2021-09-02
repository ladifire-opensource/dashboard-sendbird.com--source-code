import { useState } from 'react';

export const useDropdownSearch = () => {
  const [query, setQuery] = useState('');
  const handleSearchChange = (value: string) => {
    setQuery(value);
  };

  return {
    query,
    onChange: handleSearchChange,
  };
};
