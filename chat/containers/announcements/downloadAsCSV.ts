export const downloadAsCSV = (rows: (string | number)[][], filename: string) => {
  const csvContent = rows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  link.setAttribute('href', window.URL.createObjectURL(blob));
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link); // Required for Firefox

  link.click();
};
