const Autocompleter = ({options, setInput, input}: any) => {
  return (
    <div className="w-full relative">
      <input
        className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
        value={input}
        onChange={(e) => setInput(
            {
              label: e.target.value,
              id: ''
            }
          )
        }
        placeholder="Search..."
      />

      {options.length > 0 && (
        <ul className="absolute bg-white border-gray-100 border w-full mt-1 rounded shadow z-10 max-h-60 overflow-y-auto">
          {options.map((item: any) => (
            <li
              key={item.label}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded"
              onClick={() => {
                setInput(item);
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocompleter;