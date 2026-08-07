import {
  FileEdit,
  FilePlus,
  FileX,
  RotateCcw,
  Clock,
  Calendar,
  CalendarRange,
  CalendarDays,
  Trash2,
} from "lucide-react";

export const ACTION_CONFIG = {
  CREATED: {
    icon: FilePlus,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Create",
  },
  MODIFIED: {
    icon: FileEdit,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    label: "Modify",
  },
  DELETED: {
    icon: FileX,
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Delete",
  },
  RESTORED: {
    icon: RotateCcw,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    label: "Restore",
  },
};

export const TIME_RANGES = [
  {
    id: "last_hour",
    label: "Last 1 Hour",
    desc: "Activity from past 60 mins",
    icon: Clock,
  },
  {
    id: "today",
    label: "Today / Last 24 Hours",
    desc: "Activity from past 24 hours",
    icon: Calendar,
  },
  {
    id: "last_7d",
    label: "Last 7 Days",
    desc: "Activity from past week",
    icon: CalendarRange,
  },
  {
    id: "last_30d",
    label: "Last 30 Days",
    desc: "Activity from past month",
    icon: CalendarDays,
  },
  {
    id: "all",
    label: "All Time",
    desc: "Wipe entire logged activity history",
    icon: Trash2,
    danger: true,
  },
];

export function getRangeCutoffMs(rangeId) {
  const map = {
    last_hour: 60 * 60 * 1000,
    today: 24 * 60 * 60 * 1000,
    last_7d: 7 * 24 * 60 * 60 * 1000,
    last_30d: 30 * 24 * 60 * 60 * 1000,
  };
  return map[rangeId] || 0;
}

export function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    return "--:--";
  }
}

export function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (e) {
    return "Unknown";
  }
}

export function groupByDate(entries) {
  const groups = {};
  for (const entry of entries) {
    const dateKey = formatDate(entry.ts);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(entry);
  }
  return groups;
}
