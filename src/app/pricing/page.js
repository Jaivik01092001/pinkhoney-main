"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

function Chat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user_id = searchParams.get("user_id");
  const email = searchParams.get("email");
  const [selectedPlan, setSelectedPlan] = useState(null);

  function handle_stripe() {
    router.push(
      `http://127.0.0.1:8080/api/create_checkout_session?user_id=${user_id}&selected_plan=${selectedPlan}&email=${email}`
    );
  }

  const plans = [
    {
      id: "lifetime",
      title: "Lifetime",
      description: "Limited-time. Ends Tomorrow",
      price: "$99.99",
      isPopular: true,
    },
    {
      id: "yearly",
      title: "12 Months",
      description: "Was $140.99/year",
      price: "$99.99/year",
      isPopular: false,
    },
    {
      id: "monthly",
      title: "1 Month",
      description: "Was $29.99/month",
      price: "$19.99/month",
      isPopular: false,
    },
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    console.log(planId);
  };

  function go_to_home() {
    router.push(`/home?user_id=${user_id}&email=${email}`);
  }

  return (
    <>
      <div>
        <img
          onClick={go_to_home}
          className="w-full"
          src="/pricing_top.PNG"
          alt="Woman eating ice cream"
        />
      </div>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="md:flex-shrink-0"></div>
          {/* <div className="p-8 bg-red-400">
                        <div className="flex uppercase tracking-wide text-sm text-white font-semibold"><svg width="13" height="24" viewBox="0 0 13 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.53351 0C4.8901 9.55069 0 11.475 0 18.1709C0 21.5305 3.32096 24 6.53351 24C9.81822 24 12.9392 21.6903 12.9392 18.5006C12.9392 12.0731 8.23178 9.53263 6.53357 0H6.53351ZM3.31344 11.9948C1.76844 16.168 3.03138 20.5349 6.31085 21.9056C7.14984 22.2563 8.06365 22.3318 8.95768 22.2526C2.54108 25.0034 -1.31007 17.8426 3.31328 11.9948L3.31344 11.9948Z" fill="white" />
                        </svg><span className='ml-2'>Premium Benefits</span></div>
                        <ul className="mt-2 text-white">
                            <li className="flex items-center"><i className="fas fa-check-circle text-white mr-2"></i><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clip-rule="evenodd" d="M9 15.75C9.88642 15.75 10.7642 15.5754 11.5831 15.2362C12.4021 14.897 13.1462 14.3998 13.773 13.773C14.3998 13.1462 14.897 12.4021 15.2362 11.5831C15.5754 10.7642 15.75 9.88642 15.75 9C15.75 8.11358 15.5754 7.23583 15.2362 6.41689C14.897 5.59794 14.3998 4.85382 13.773 4.22703C13.1462 3.60023 12.4021 3.10303 11.5831 2.76381C10.7642 2.42459 9.88642 2.25 9 2.25C7.20979 2.25 5.4929 2.96116 4.22703 4.22703C2.96116 5.4929 2.25 7.20979 2.25 9C2.25 10.7902 2.96116 12.5071 4.22703 13.773C5.4929 15.0388 7.20979 15.75 9 15.75ZM8.826 11.73L12.576 7.23L11.424 6.27L8.199 10.1392L6.53025 8.46975L5.46975 9.53025L7.71975 11.7802L8.30025 12.3608L8.826 11.73Z" fill="white" />
                            </svg>
                                Unlimited likes</li>
                            <li className="flex items-center"><i className="fas fa-check-circle text-white mr-2"></i><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clip-rule="evenodd" d="M9 15.75C9.88642 15.75 10.7642 15.5754 11.5831 15.2362C12.4021 14.897 13.1462 14.3998 13.773 13.773C14.3998 13.1462 14.897 12.4021 15.2362 11.5831C15.5754 10.7642 15.75 9.88642 15.75 9C15.75 8.11358 15.5754 7.23583 15.2362 6.41689C14.897 5.59794 14.3998 4.85382 13.773 4.22703C13.1462 3.60023 12.4021 3.10303 11.5831 2.76381C10.7642 2.42459 9.88642 2.25 9 2.25C7.20979 2.25 5.4929 2.96116 4.22703 4.22703C2.96116 5.4929 2.25 7.20979 2.25 9C2.25 10.7902 2.96116 12.5071 4.22703 13.773C5.4929 15.0388 7.20979 15.75 9 15.75ZM8.826 11.73L12.576 7.23L11.424 6.27L8.199 10.1392L6.53025 8.46975L5.46975 9.53025L7.71975 11.7802L8.30025 12.3608L8.826 11.73Z" fill="white" />
                            </svg>
                                Super likes (Get more matches)</li>
                            <li className="flex items-center"><i className="fas fa-check-circle text-white mr-2"></i><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clip-rule="evenodd" d="M9 15.75C9.88642 15.75 10.7642 15.5754 11.5831 15.2362C12.4021 14.897 13.1462 14.3998 13.773 13.773C14.3998 13.1462 14.897 12.4021 15.2362 11.5831C15.5754 10.7642 15.75 9.88642 15.75 9C15.75 8.11358 15.5754 7.23583 15.2362 6.41689C14.897 5.59794 14.3998 4.85382 13.773 4.22703C13.1462 3.60023 12.4021 3.10303 11.5831 2.76381C10.7642 2.42459 9.88642 2.25 9 2.25C7.20979 2.25 5.4929 2.96116 4.22703 4.22703C2.96116 5.4929 2.25 7.20979 2.25 9C2.25 10.7902 2.96116 12.5071 4.22703 13.773C5.4929 15.0388 7.20979 15.75 9 15.75ZM8.826 11.73L12.576 7.23L11.424 6.27L8.199 10.1392L6.53025 8.46975L5.46975 9.53025L7.71975 11.7802L8.30025 12.3608L8.826 11.73Z" fill="white" />
                            </svg>
                                Unlimited rewinds</li>
                            <li className="flex items-center"><i className="fas fa-check-circle text-white mr-2"></i><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clip-rule="evenodd" d="M9 15.75C9.88642 15.75 10.7642 15.5754 11.5831 15.2362C12.4021 14.897 13.1462 14.3998 13.773 13.773C14.3998 13.1462 14.897 12.4021 15.2362 11.5831C15.5754 10.7642 15.75 9.88642 15.75 9C15.75 8.11358 15.5754 7.23583 15.2362 6.41689C14.897 5.59794 14.3998 4.85382 13.773 4.22703C13.1462 3.60023 12.4021 3.10303 11.5831 2.76381C10.7642 2.42459 9.88642 2.25 9 2.25C7.20979 2.25 5.4929 2.96116 4.22703 4.22703C2.96116 5.4929 2.25 7.20979 2.25 9C2.25 10.7902 2.96116 12.5071 4.22703 13.773C5.4929 15.0388 7.20979 15.75 9 15.75ZM8.826 11.73L12.576 7.23L11.424 6.27L8.199 10.1392L6.53025 8.46975L5.46975 9.53025L7.71975 11.7802L8.30025 12.3608L8.826 11.73Z" fill="white" />
                            </svg>
                                Faster responses</li>
                            <li className="flex items-center"><i className="fas fa-check-circle text-white mr-2"></i><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clip-rule="evenodd" d="M9 15.75C9.88642 15.75 10.7642 15.5754 11.5831 15.2362C12.4021 14.897 13.1462 14.3998 13.773 13.773C14.3998 13.1462 14.897 12.4021 15.2362 11.5831C15.5754 10.7642 15.75 9.88642 15.75 9C15.75 8.11358 15.5754 7.23583 15.2362 6.41689C14.897 5.59794 14.3998 4.85382 13.773 4.22703C13.1462 3.60023 12.4021 3.10303 11.5831 2.76381C10.7642 2.42459 9.88642 2.25 9 2.25C7.20979 2.25 5.4929 2.96116 4.22703 4.22703C2.96116 5.4929 2.25 7.20979 2.25 9C2.25 10.7902 2.96116 12.5071 4.22703 13.773C5.4929 15.0388 7.20979 15.75 9 15.75ZM8.826 11.73L12.576 7.23L11.424 6.27L8.199 10.1392L6.53025 8.46975L5.46975 9.53025L7.71975 11.7802L8.30025 12.3608L8.826 11.73Z" fill="white" />
                            </svg>
                                Priority access to new features</li>
                            <li className="flex items-center"><i className="fas fa-check-circle text-white mr-2"></i><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clip-rule="evenodd" d="M9 15.75C9.88642 15.75 10.7642 15.5754 11.5831 15.2362C12.4021 14.897 13.1462 14.3998 13.773 13.773C14.3998 13.1462 14.897 12.4021 15.2362 11.5831C15.5754 10.7642 15.75 9.88642 15.75 9C15.75 8.11358 15.5754 7.23583 15.2362 6.41689C14.897 5.59794 14.3998 4.85382 13.773 4.22703C13.1462 3.60023 12.4021 3.10303 11.5831 2.76381C10.7642 2.42459 9.88642 2.25 9 2.25C7.20979 2.25 5.4929 2.96116 4.22703 4.22703C2.96116 5.4929 2.25 7.20979 2.25 9C2.25 10.7902 2.96116 12.5071 4.22703 13.773C5.4929 15.0388 7.20979 15.75 9 15.75ZM8.826 11.73L12.576 7.23L11.424 6.27L8.199 10.1392L6.53025 8.46975L5.46975 9.53025L7.71975 11.7802L8.30025 12.3608L8.826 11.73Z" fill="white" />
                            </svg>
                                Photo requests (coming soon)</li>
                            <li className="flex items-center"><i className="fas fa-check-circle text-white mr-2"></i><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clip-rule="evenodd" d="M9 15.75C9.88642 15.75 10.7642 15.5754 11.5831 15.2362C12.4021 14.897 13.1462 14.3998 13.773 13.773C14.3998 13.1462 14.897 12.4021 15.2362 11.5831C15.5754 10.7642 15.75 9.88642 15.75 9C15.75 8.11358 15.5754 7.23583 15.2362 6.41689C14.897 5.59794 14.3998 4.85382 13.773 4.22703C13.1462 3.60023 12.4021 3.10303 11.5831 2.76381C10.7642 2.42459 9.88642 2.25 9 2.25C7.20979 2.25 5.4929 2.96116 4.22703 4.22703C2.96116 5.4929 2.25 7.20979 2.25 9C2.25 10.7902 2.96116 12.5071 4.22703 13.773C5.4929 15.0388 7.20979 15.75 9 15.75ZM8.826 11.73L12.576 7.23L11.424 6.27L8.199 10.1392L6.53025 8.46975L5.46975 9.53025L7.71975 11.7802L8.30025 12.3608L8.826 11.73Z" fill="white" />
                            </svg>
                                Voice chats (coming soon)</li>
                        </ul>
                    </div> */}
        </div>
        <div className="p-8 pt-2 pb-4 bg-pink-100 rounded-xl">
          <h2 className="text-xl font-bold text-gray-900">Select Plan</h2>
          <div className="mt-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`p-4 bg-white rounded-lg shadow-md mb-4 cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.id ? "border-2 border-pink-500" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {plan.title}
                      {plan.isPopular && (
                        <span className="text-xs bg-red-500 text-white rounded-full px-2 py-1 ml-2">
                          Most Popular
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {plan.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* <div className="mt-2">
                        <div className="p-4 bg-white rounded-lg shadow-md mb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 ">Lifetime <span className="text-xs bg-red-500 text-white rounded-full px-2 py-1 ml-2">Most Popular</span></h3>
                                    <p className="text-sm text-gray-500">Limited-time. Ends 11/30/24</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">$99.99</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-md mb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">12 Months</h3>
                                    <p className="text-sm text-gray-500">Was $140.99/year</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">$99.99/year</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-md mb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">1 Month</h3>
                                    <p className="text-sm text-gray-500">Was $29.99/month</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">$19.99/month</p>
                                </div>
                            </div>
                        </div>
                    </div> */}
          <div className="flex items-center text-gray-500 text-sm mt-4">
            <i className="fas fa-info-circle mr-2"></i>
            <p>No hidden fees. Cancel subscription at any time</p>
          </div>
          <button
            onClick={handle_stripe}
            className="sticky bottom-4 mt-1 w-full bg-pink-500 text-white text-lg font-bold py-3 rounded-lg shadow-md hover:bg-pink-600 transition duration-300"
          >
            Upgrade Now <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </>
  );
}

export default Chat;
