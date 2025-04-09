import React from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";


export default function EmojiPicker({ onSelect }) {
  return (
    <div>
      <Picker data={data} onEmojiSelect={onSelect} theme="dark" />
    </div>
  );
}
