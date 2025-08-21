import { Input } from "./input";

// Simple date picker component using HTML5 date input
export const DatePicker = ({ value, onChange, placeholder, ...props }) => {
  return (
    <Input
      type="date"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  );
};