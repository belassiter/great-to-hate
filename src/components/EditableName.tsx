import { useState } from 'react';

export default function EditableName({ name, isMe, onSave }: { name: string, isMe?: boolean, onSave: (val: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(name);

  if (!isMe) return <span>{name}</span>;

  if (editing) {
    return (
      <input
        autoFocus
        maxLength={15}
        value={val}
        className="bg-gray-700 text-white rounded px-2 py-1 outline-none focus:ring-2 focus:ring-primary-500 w-32"
        onChange={e => setVal(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (val.trim() && val !== name) onSave(val.trim());
          else setVal(name);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
    );
  }

  return (
    <span 
      className="cursor-pointer border-b border-dashed border-gray-500 hover:text-primary-400 hover:border-primary-400 transition-colors"
      onClick={() => setEditing(true)}
      title="Click to edit name"
    >
      {name}
    </span>
  );
}
