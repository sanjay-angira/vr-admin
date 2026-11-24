"use client";

import { getIn, type FormikProps } from "formik";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { FormLabel } from "./FormLabel";

type FormDatePickerProps<T extends Record<string, unknown>> = {
  formik: FormikProps<T>;
  name: keyof T & string | string;
  label: string;
  required?: boolean;
  mode?: "date" | "datetime";
  className?: string;
};

function parseValue(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!match) return null;

  const [, year, month, day, hour = "0", minute = "0"] = match;
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toFormValue(date: Date, mode: "date" | "datetime") {
  const pad = (value: number) => String(value).padStart(2, "0");
  const dateValue = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return mode === "date"
    ? dateValue
    : `${dateValue}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDisplay(value: string, mode: "date" | "datetime") {
  const date = parseValue(value);
  if (!date) return "";
  const dateText = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return mode === "datetime"
    ? `${dateText} at ${date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })}`
    : dateText;
}

export function FormDatePicker<T extends Record<string, unknown>>({
  formik,
  name,
  label,
  required,
  mode = "date",
  className,
}: FormDatePickerProps<T>) {
  const id = useId();
  const errorId = `${id}-error`;
  const containerRef = useRef<HTMLDivElement>(null);
  const rawValue = String(getIn(formik.values, name) ?? "");
  const selectedDate = parseValue(rawValue);
  const error = getIn(formik.touched, name) ? getIn(formik.errors, name) : undefined;
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        void formik.setFieldTouched(name, true);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        void formik.setFieldTouched(name, true);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [formik, name, open]);

  function showPicker() {
    const current = parseValue(rawValue);
    const base = current ?? new Date();
    setVisibleMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setHour(current?.getHours() ?? 9);
    setMinute(current?.getMinutes() ?? 0);
    setOpen(true);
  }

  function updateDate(day: Date) {
    const date = new Date(day);
    date.setHours(hour, minute, 0, 0);
    setVisibleMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    void formik.setFieldValue(name, toFormValue(date, mode));
    if (mode === "date") {
      setOpen(false);
      void formik.setFieldTouched(name, true);
    }
  }

  function updateTime(nextHour: number, nextMinute: number) {
    setHour(nextHour);
    setMinute(nextMinute);
    if (selectedDate) {
      const date = new Date(selectedDate);
      date.setHours(nextHour, nextMinute, 0, 0);
      void formik.setFieldValue(name, toFormValue(date, "datetime"));
    }
  }

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return new Date(year, month, day);
  });
  const selectedKey = selectedDate
    ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    : "";

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <FormLabel label={label} required={required} htmlFor={id} />
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={error ? errorId : undefined}
        onClick={() => (open ? setOpen(false) : showPicker())}
        onBlur={() => {
          if (!open) void formik.setFieldTouched(name, true);
        }}
        className={`flex h-[42px] w-full items-center justify-between rounded-lg border bg-white px-3.5 py-2.5 text-left text-sm focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/15 ${
          error ? "border-red-500" : "border-zinc-300"
        } ${rawValue ? "text-zinc-900" : "text-zinc-400"}`}
      >
        <span>
          {formatDisplay(rawValue, mode) || (mode === "datetime" ? "Select date and time" : "Select date")}
        </span>
        <CalendarDays className="h-4 w-4 text-zinc-500" aria-hidden="true" />
      </button>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {String(error)}
        </p>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={`${label} picker`}
          className="absolute left-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-4 shadow-xl"
        >
          {mode === "datetime" && (
            <div className="mb-4 rounded-xl border border-admin-primary/20 bg-admin-primary/[0.04] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  <Clock3 className="h-4 w-4 text-admin-primary" aria-hidden="true" />
                  Choose time
                </span>
                <span className="text-xs text-zinc-500">24-hour</span>
              </div>
              <div className="flex items-center justify-center gap-5">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    aria-label="Increase hour"
                    onClick={() => updateTime((hour + 1) % 24, minute)}
                    className="rounded-md p-1.5 text-zinc-500 hover:bg-white hover:text-admin-primary"
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-12 text-center font-mono text-2xl font-semibold tabular-nums text-zinc-900">
                    {String(hour).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    aria-label="Decrease hour"
                    onClick={() => updateTime((hour + 23) % 24, minute)}
                    className="rounded-md p-1.5 text-zinc-500 hover:bg-white hover:text-admin-primary"
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">
                    Hour
                  </span>
                </div>
                <span className="pb-5 font-mono text-2xl font-semibold text-zinc-400">
                  :
                </span>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    aria-label="Increase minute"
                    onClick={() => updateTime(hour, (minute + 1) % 60)}
                    className="rounded-md p-1.5 text-zinc-500 hover:bg-white hover:text-admin-primary"
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-12 text-center font-mono text-2xl font-semibold tabular-nums text-zinc-900">
                    {String(minute).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    aria-label="Decrease minute"
                    onClick={() => updateTime(hour, (minute + 59) % 60)}
                    className="rounded-md p-1.5 text-zinc-500 hover:bg-white hover:text-admin-primary"
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">
                    Minute
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}
              className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold text-zinc-900">
              {visibleMonth.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}
              className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-zinc-500">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((weekday) => (
              <span key={weekday} className="py-2">
                {weekday}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const isCurrentMonth = day.getMonth() === month;
              const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
              const isSelected = key === selectedKey;
              const isToday = toFormValue(day, "date") === toFormValue(new Date(), "date");
              return (
                <button
                  key={toFormValue(day, "date")}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => updateDate(day)}
                  className={`h-9 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-admin-primary text-white"
                      : isToday
                        ? "border border-admin-primary text-admin-primary"
                        : isCurrentMonth
                          ? "text-zinc-800 hover:bg-zinc-100"
                          : "text-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {mode === "datetime" && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void formik.setFieldTouched(name, true);
              }}
              className="mt-3 w-full rounded-lg bg-admin-primary px-3 py-2 text-sm font-medium text-white hover:bg-admin-primary-hover"
            >
              Apply date and time
            </button>
          )}
        </div>
      )}
    </div>
  );
}
