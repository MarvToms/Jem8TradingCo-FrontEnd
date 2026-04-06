import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header, Footer } from "../components/Layout";

const PRIVACY_SECTIONS = [
  {
    id: "10.1",
    title: "Data Collection and Purpose",
    content:
      "Jem 8 Circle Trading Co. collects personal information from employees, clients, and suppliers solely for legitimate business purposes, including payroll, employment records, and operational requirements.",
  },
  {
    id: "10.2",
    title: "Data Storage and Security",
    content:
      "All personal data is stored securely, whether in physical files or digital systems, to prevent unauthorized access, loss, or damage.",
  },
  {
    id: "10.3",
    title: "Access and Use of Information",
    content:
      "Access to personal information is limited to authorized personnel only. Data will be used exclusively for legitimate business purposes and in compliance with company policies.",
  },
  {
    id: "10.4",
    title: "Employee Rights",
    content:
      "Employees have the right to access and request corrections to their personal information held by the company, in accordance with the Data Privacy Act of 2012 (RA 10173).",
  },
  {
    id: "10.5",
    title: "Confidentiality",
    content:
      "Employees are required to maintain the confidentiality of personal and company information. Unauthorized disclosure of sensitive information is strictly prohibited and may result in disciplinary action.",
  },
];

const TERMS_PARAGRAPHS = [
  "The terms and conditions of employment at Jem 8 Circle Co. are governed by the employee's written employment contract, company policies, and applicable Philippine labor laws. These terms define the rights, responsibilities, and obligations of both the Company and the employee.",
  "Employees are expected to comply with assigned work schedules, company rules, safety standards, and operational procedures. They must perform their duties in a professional manner and act in the best interest of the Company at all times.",
  "Compensation, benefits, working hours, leave entitlements, and other employment privileges shall be provided in accordance with the employee's contract and existing laws. Any additional benefits granted by the Company shall be subject to management approval and company policies.",
  "Employees may be assigned to different tasks, work areas, or schedules as required by business operations, provided that such assignments are reasonable and within the scope of the employee's position and qualifications.",
  "All employees are required to observe confidentiality, protect company property, and avoid conflicts of interest. Engaging in activities that may harm the Company's reputation or operations is strictly prohibited.",
  "Any changes in the terms and conditions of employment shall be communicated in writing and implemented only after proper notice and, when necessary, mutual agreement.",
];

const COOKIE_SECTIONS = [
  {
    id: "c1",
    title: "What Are Cookies?",
    content:
      "Cookies are small data files stored on your device when you visit our website or use our system. They help us keep you logged in and ensure the security of your session.",
  },
  {
    id: "c2",
    title: "Authentication Cookie",
    content:
      "We use an HTTP-only session cookie for authentication purposes. This cookie is set upon login and is used to verify your identity on each request, providing an additional layer of security.",
  },
  {
    id: "c3",
    title: "Cookie Expiration",
    content:
      "The authentication cookie expires after 24 hours from the time of login. Once expired, the cookie value is set to null and your session is automatically invalidated. You will be required to log in again to continue accessing the system.",
  },
  {
    id: "c4",
    title: "HTTP-Only Flag",
    content:
      "Our cookies are configured with the HTTP-only flag enabled. This means the cookie is only transmitted over HTTP/HTTPS requests and is not accessible through client-side scripts, providing an additional layer of security.",
  },
  {
    id: "c5",
    title: "No Third-Party Cookies",
    content:
      "Jem 8 Circle Trading Co. does not use third-party cookies for advertising or tracking purposes. Cookies are strictly limited to maintaining secure authentication sessions.",
  },
  {
    id: "c6",
    title: "Cookie Summary",
    rows: [
      { name: "auth_token", type: "HTTP-Only", purpose: "User authentication", expiry: "24 hours" },
    ],
  },
];

export default function Privacypolicy() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("privacy");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("tab") === "terms") {
      setActiveTab("terms");
    } else if (params.get("tab") === "cookies") {
      setActiveTab("cookies");
    }
  }, [location.search]);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white" style={{ paddingTop: "var(--header-h, 80px)" }}>
        <div className="max-w-[960px] mx-auto px-6 py-16 lg:py-24">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-10">
            <Link to="/" className="hover:text-[#2e6b45] transition-colors no-underline text-slate-400">
              Home
            </Link>
            <span>›</span>
            <span className="text-slate-600">
              {activeTab === "privacy"
                ? "Privacy Policy"
                : activeTab === "terms"
                ? "Terms & Conditions"
                : "Cookie Policy"}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">

            {/* ── Sidebar ── */}
            <aside className="lg:w-[220px] flex-shrink-0">
              <div className="sticky top-[100px]">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
                  Legal
                </p>
                <nav className="flex flex-row lg:flex-col gap-1">
                  <button
                    onClick={() => setActiveTab("privacy")}
                    className={`text-left w-full px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150 border-none cursor-pointer ${
                      activeTab === "privacy"
                        ? "bg-[#edf4f0] text-[#2e6b45] font-semibold"
                        : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => setActiveTab("terms")}
                    className={`text-left w-full px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150 border-none cursor-pointer ${
                      activeTab === "terms"
                        ? "bg-[#edf4f0] text-[#2e6b45] font-semibold"
                        : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    Terms & Conditions
                  </button>
                  <button
                    onClick={() => setActiveTab("cookies")}
                    className={`text-left w-full px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150 border-none cursor-pointer ${
                      activeTab === "cookies"
                        ? "bg-[#edf4f0] text-[#2e6b45] font-semibold"
                        : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    Cookie Policy
                  </button>
                </nav>
              </div>
            </aside>

            {/* ── Vertical Divider (desktop only) ── */}
            <div className="hidden lg:block w-px bg-slate-100 flex-shrink-0" />

            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0">

              {/* PRIVACY POLICY */}
              {activeTab === "privacy" && (
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Privacy Policy</h1>
                  <p className="text-sm text-slate-400 mb-1">Effective Date: April 6, 2026</p>
                  <p className="text-sm text-slate-400 mb-8">
                    In compliance with the Data Privacy Act of 2012 (RA 10173)
                  </p>

                  <div className="border-t border-slate-100 mb-8" />

                  <p className="text-[15px] text-slate-600 leading-relaxed mb-10">
                    JEM 8 Circle Trading Co. is committed to protecting the privacy and security of
                    personal information. This policy outlines how we collect, store, use, and protect
                    data belonging to our employees, clients, and suppliers.
                  </p>

                  <div className="flex flex-col gap-8">
                    {PRIVACY_SECTIONS.map((section) => (
                      <div key={section.id}>
                        <h2 className="text-[15px] font-semibold text-slate-800 mb-2">
                          {section.title}
                        </h2>
                        <p className="text-[14px] text-slate-500 leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 mt-12 mb-8" />

                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    For questions about this policy, contact us at{" "}
                    <a href="mailto:jem8circletrading@gmail.com" className="text-[#2e6b45] no-underline hover:underline">
                      jem8circletrading@gmail.com
                    </a>{" "}
                    or call (02) 8805-1432.
                  </p>
                </div>
              )}

              {/* TERMS & CONDITIONS */}
              {activeTab === "terms" && (
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Terms & Conditions</h1>
                  <p className="text-sm text-slate-400 mb-1">Effective Date: April 6, 2026</p>
                  <p className="text-sm text-slate-400 mb-8">
                    Governed by Philippine Labor Laws and Company Policy
                  </p>

                  <div className="border-t border-slate-100 mb-8" />

                  <h2 className="text-[15px] font-semibold text-slate-800 mb-6">
                    Terms and Conditions of Employment
                  </h2>

                  <div className="flex flex-col gap-5">
                    {TERMS_PARAGRAPHS.map((para, i) => (
                      <p key={i} className="text-[14px] text-slate-500 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 mt-12 mb-8" />

                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    For questions about these terms, contact us at{" "}
                    <a href="mailto:jem8circletrading@gmail.com" className="text-[#2e6b45] no-underline hover:underline">
                      jem8circletrading@gmail.com
                    </a>{" "}
                    or call (02) 8805-1432.
                  </p>
                </div>
              )}

              {/* COOKIE POLICY */}
              {activeTab === "cookies" && (
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Cookie Policy</h1>
                  <p className="text-sm text-slate-400 mb-1">Effective Date: April 6, 2026</p>
                  <p className="text-sm text-slate-400 mb-8">
                    How Jem 8 Circle Trading Co. uses cookies
                  </p>

                  <div className="border-t border-slate-100 mb-8" />

                  <p className="text-[15px] text-slate-600 leading-relaxed mb-10">
                    This Cookie Policy explains how Jem 8 Circle Trading Co. uses cookies to maintain
                    secure and authenticated sessions within our system. We only use essential cookies
                    necessary for the operation of our platform.
                  </p>

                  <div className="flex flex-col gap-8">
                    {COOKIE_SECTIONS.map((section) =>
                      section.rows ? (
                        /* Cookie Summary Table */
                        <div key={section.id}>
                          <h2 className="text-[15px] font-semibold text-slate-800 mb-4">
                            {section.title}
                          </h2>
                          <div className="overflow-x-auto rounded-lg border border-slate-100">
                            <table className="w-full text-[13px]">
                              <thead>
                                <tr className="bg-[#edf4f0]">
                                  <th className="text-left px-4 py-3 font-semibold text-[#2e6b45]">Cookie Name</th>
                                  <th className="text-left px-4 py-3 font-semibold text-[#2e6b45]">Type</th>
                                  <th className="text-left px-4 py-3 font-semibold text-[#2e6b45]">Purpose</th>
                                  <th className="text-left px-4 py-3 font-semibold text-[#2e6b45]">Expiry</th>
                                </tr>
                              </thead>
                              <tbody>
                                {section.rows.map((row, i) => (
                                  <tr key={i} className="border-t border-slate-100">
                                    <td className="px-4 py-3 text-slate-700 font-mono">{row.name}</td>
                                    <td className="px-4 py-3">
                                      <span className="inline-block bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded">
                                        {row.type}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{row.purpose}</td>
                                    <td className="px-4 py-3">
                                      <span className="inline-block bg-amber-50 text-amber-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                                        {row.expiry}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Cookie lifecycle note */}
                          <div className="mt-4 flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
                            <span className="text-[18px] mt-0.5">🍪</span>
                            <div>
                              <p className="text-[13px] font-semibold text-slate-700 mb-0.5">
                                Cookie Lifecycle
                              </p>
                              <p className="text-[12px] text-slate-500 leading-relaxed">
                                Upon login, an HTTP-only cookie is set. After{" "}
                                <span className="font-semibold text-slate-700">24 hours</span>, the
                                cookie expires and its value is set to{" "}
                                <code className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded text-[11px]">
                                  null
                                </code>
                                . The user must log in again to renew the session.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={section.id}>
                          <h2 className="text-[15px] font-semibold text-slate-800 mb-2">
                            {section.title}
                          </h2>
                          <p className="text-[14px] text-slate-500 leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="border-t border-slate-100 mt-12 mb-8" />

                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    For questions about our cookie usage, contact us at{" "}
                    <a href="mailto:jem8circletrading@gmail.com" className="text-[#2e6b45] no-underline hover:underline">
                      jem8circletrading@gmail.com
                    </a>{" "}
                    or call (02) 8805-1432.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}