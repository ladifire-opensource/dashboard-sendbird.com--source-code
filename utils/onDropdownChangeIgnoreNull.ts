export const onDropdownChangeIgnoreNull = <T>(handleDropdownChange: (selectedItem: T) => void) => (
  selectedItem: T | null,
) => {
  if (selectedItem == null) {
    return;
  }
  handleDropdownChange(selectedItem);
};
