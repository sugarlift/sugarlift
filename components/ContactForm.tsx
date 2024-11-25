"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@headlessui/react";

// Add input class constants
const INPUT_STYLES = {
  base: "w-full border border-zinc-500 px-4 py-3 bg-transparent placeholder:text-zinc-800 focus:ring-4 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-200",
  error: "border-red-600 ring-red-100 focus:border-red-600 dark:ring-0",
  normal:
    "ring-zinc-100 focus:border-zinc-600 dark:border-zinc-600 dark:ring-0 dark:focus:border-white",
};

const getInputClassName = (error?: boolean) => {
  return `${INPUT_STYLES.base} ${error ? INPUT_STYLES.error : INPUT_STYLES.normal}`;
};

type FormData = {
  name: string;
  email: string;
  message: string;
  topic: string;
  firm?: string;
  role?: string;
  artistName?: string;
  budget?: string;
  botcheck: string;
};

export default function Contact() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onTouched",
  });

  const [message, setMessage] = useState<string>("");
  const [showError, setShowError] = useState(false);

  const selectedTopic = watch("topic");

  const apiKey =
    process.env.PUBLIC_ACCESS_KEY || "b4aef617-d7d5-49c6-9978-634aa6ab9500";

  const { submit: onSubmit } = useWeb3Forms({
    access_key: apiKey,
    settings: {
      from_name: "Sugarlift.com",
      subject: "New inquiry from Sugarlift.com",
    },
    onSuccess: () => {
      reset();
      setShowError(false);
      router.push("/contact/thank-you");
    },
    onError: (msg) => {
      setShowError(true);
      setMessage(msg);
    },
  });

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="my-10">
        <input
          type="checkbox"
          id=""
          className="hidden"
          style={{ display: "none" }}
          {...register("botcheck")}
        ></input>

        <div className="mb-5">
          <select
            className={getInputClassName(!!errors.topic)}
            {...register("topic", { required: "Please select a topic" })}
          >
            <option value="">Select a topic...</option>
            <option value="consultation">Scheduling a consultation</option>
            <option value="artist">Artist inquiry</option>
            <option value="custom">Custom artwork inquiry</option>
          </select>
          {errors.topic && (
            <div className="mt-1 text-red-600">
              <small>{errors.topic.message?.toString()}</small>
            </div>
          )}
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder="Full Name"
            autoComplete="false"
            className={getInputClassName(!!errors.name)}
            {...register("name", {
              required: "Full name is required",
              maxLength: 80,
            })}
          />
          {errors.name && (
            <div className="mt-1 text-red-600">
              <small>{errors.name.message?.toString()}</small>
            </div>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="email_address" className="sr-only">
            Email Address
          </label>
          <input
            id="email_address"
            type="email"
            placeholder="Email Address"
            autoComplete="false"
            className={getInputClassName(!!errors.email)}
            {...register("email", {
              required: "Enter your email",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Please enter a valid email",
              },
            })}
          />
          {errors.email && (
            <div className="mt-1 text-red-600">
              <small>{errors.email.message?.toString()}</small>
            </div>
          )}
        </div>

        {selectedTopic === "consultation" && (
          <>
            <div className="mb-5">
              <input
                type="text"
                placeholder="Firm"
                className={getInputClassName(!!errors.firm)}
                {...register("firm", { required: "Firm name is required" })}
              />
              {errors.firm && (
                <div className="mt-1 text-red-600">
                  <small>{errors.firm.message?.toString()}</small>
                </div>
              )}
            </div>
            <div className="mb-5">
              <input
                type="text"
                placeholder="Role"
                className={getInputClassName(!!errors.role)}
                {...register("role", { required: "Role is required" })}
              />
              {errors.role && (
                <div className="mt-1 text-red-600">
                  <small>{errors.role.message?.toString()}</small>
                </div>
              )}
            </div>
          </>
        )}

        {(selectedTopic === "artist" || selectedTopic === "custom") && (
          <div className="mb-5">
            <input
              type="text"
              placeholder="Artist Name"
              className={getInputClassName(!!errors.artistName)}
              {...register("artistName", {
                required: "Artist name is required",
              })}
            />
            {errors.artistName && (
              <div className="mt-1 text-red-600">
                <small>{errors.artistName.message?.toString()}</small>
              </div>
            )}
          </div>
        )}

        {selectedTopic === "custom" && (
          <div className="mb-5">
            <input
              type="text"
              placeholder="Budget"
              className={getInputClassName(!!errors.budget)}
              {...register("budget", { required: "Budget is required" })}
            />
            {errors.budget && (
              <div className="mt-1 text-red-600">
                <small>{errors.budget.message?.toString()}</small>
              </div>
            )}
          </div>
        )}

        <div className="mb-3">
          <textarea
            placeholder="Your Message"
            className={`h-36 ${getInputClassName(!!errors.message)}`}
            {...register("message", {
              required: "Enter your Message",
            })}
          />
          {errors.message && (
            <div className="mt-1 text-red-600">
              <small>{errors.message.message?.toString()}</small>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="group inline-flex items-center bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
        >
          {isSubmitting ? (
            <svg
              className="mx-auto h-5 w-5 animate-spin text-white dark:text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <span className="inline-flex items-center">
              Send inquiry
              <ArrowRight
                className="-me-1 ms-2 mt-0.5 transition-transform group-hover:translate-x-0.5"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>
          )}
        </Button>
      </form>

      {showError && (
        <div className="mt-3 text-center text-sm text-red-500">
          {message || "Something went wrong. Please try later."}
        </div>
      )}
    </>
  );
}
