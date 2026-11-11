"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

import { apiRequest } from "@/lib/api";
import { getErrorMessage } from "@/lib/api-errors";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setStatus("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      await apiRequest("/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setStatus(
        "Thank you! Your message has been received. We will get back to you soon.",
      );

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f9ff] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-14 text-center">
          <span className="rounded-full bg-[#efedff] px-5 py-2 text-sm font-semibold text-[#737cff]">
            CONTACT US
          </span>

          <h1 className="mt-6 text-4xl font-bold text-[#211d50] sm:text-5xl">
            We&apos;d Love to Hear From You
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Have a question, suggestion, or need help? Send us a message and
            we&apos;ll be happy to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Contact Information */}
          <section className="rounded-3xl bg-[#a5acf3] p-8 text-white lg:col-span-2">
            <h2 className="text-2xl font-bold">Get in Touch</h2>

            <p className="mt-3 text-sm leading-7 text-white/90">
              We&apos;re here to make your learning experience easier and better.
            </p>

            <div className="mt-10 space-y-8">
              <div className="flex items-start gap-4">
                <Mail size={22} />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="mt-1 text-sm text-white/90">
                    sharmabrijesh97397@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone size={22} />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="mt-1 text-sm text-white/90">
                    +91 87278-46010 , +91 94631-75727
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin size={22} />
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p className="mt-1 text-sm text-white/90">
                    Moga Road, Firozpur, Punjab
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="rounded-3xl border border-[#e2defa] bg-white p-8 shadow-sm lg:col-span-3">
            <div className="mb-7 flex items-center gap-3">
              <MessageSquare className="text-[#737cff]" size={25} />
              <h2 className="text-2xl font-bold text-[#211d50]">
                Send Us a Message
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter message subject"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
                >
                  {error}
                </p>
              )}

              {status && (
                <p
                  role="status"
                  className="rounded-xl bg-[#efedff] p-3 text-sm text-[#454cff]"
                >
                  {status}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-[#a5acf3] px-7 py-3 font-semibold text-white transition hover:bg-[#858ff0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send size={17} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
