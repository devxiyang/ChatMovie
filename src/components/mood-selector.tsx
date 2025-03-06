import { useState } from "react";

interface MoodSelectorProps {
  onSelectMood: (mood: string | null) => void;
  selectedMood: string | null;
}

export function MoodSelector({ onSelectMood, selectedMood }: MoodSelectorProps) {
  const moods = [
    { emoji: "😊", label: "Cheerful", value: "cheerful" },
    { emoji: "🤔", label: "Reflective", value: "reflective" },
    { emoji: "😔", label: "Gloomy", value: "sad" },
    { emoji: "😲", label: "Surprised", value: "surprising" },
    { emoji: "❤️", label: "Romantic", value: "romantic" },
    { emoji: "😂", label: "Humorous", value: "funny" },
    { emoji: "😨", label: "Thrilling", value: "thrilling" },
    { emoji: "👻", label: "Spooky", value: "scary" },
    { emoji: "✨", label: "Inspiring", value: "inspiring" },
    { emoji: "🧠", label: "Thought-provoking", value: "thought-provoking" },
    { emoji: "🥺", label: "Emotional", value: "emotional" },
    { emoji: "🔥", label: "Exciting", value: "exciting" },
    { emoji: "🌈", label: "Uplifting", value: "uplifting" },
    { emoji: "🚀", label: "Adventurous", value: "adventurous" },
    { emoji: "🔍", label: "Mysterious", value: "mysterious" },
  ];

  return (
    <div className="mb-10">
      <h2 className="section-title text-center mb-6">How are you feeling today?</h2>
      <div className="mood-grid">
        {moods.map((mood) => (
          <button
            key={mood.value}
            className={`mood-button ${selectedMood === mood.value ? "selected" : ""}`}
            onClick={() => onSelectMood(selectedMood === mood.value ? null : mood.value)}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 