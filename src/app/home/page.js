// app/page.js
"use client"
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

export default function Home() {
  const [user_id, set_user_id] = useState("")
  const [tokens, set_tokens] = useState("")
  const [subscribed, set_subscribed] = useState("")

  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  async function check_email(email) {
    const formData = new FormData();
    formData.append('email', email);
    console.log("email request sent")
    const response = await fetch('http://127.0.0.1:8080/check_email', {
      method: 'POST',
      body: formData,
    });

    const jsonData = await response.json(); // Parse JSON response
    console.log(jsonData);
    const user_id = jsonData["user_id"]
    const tokens = jsonData["tokens"]
    const subscribed = jsonData["subscribed"]
    if (subscribed == "no"){
      router.push(`/pricing?user_id=${user_id}&email=${email}`)
    }
    set_user_id(user_id)
    set_tokens(tokens)
    set_subscribed(subscribed)
  }


  useEffect(() => {
    check_email(email);
  }, []); // Ensure this runs only once on component mount

  const router = useRouter()

  const [profiles, set_original_profiles] = useState([
    { id: 1, name: 'Amara', personality: 'Confident and playful', image: '/Amara3-ps.jpg.jpg' },
    { id: 2, name: 'Amaya', personality: 'Calm, grounded, and nature-oriented', image: '/Amaya2.jpg' },
    { id: 3, name: 'Aria', personality: 'Shy and introspective', image: '/Aria3.jpg' },
    { id: 4, name: 'Ava', personality: 'Shy and loyal', image: '/Ava3-ps.jpg.jpg' },
    { id: 5, name: 'Aya', personality: 'Shy and loyal', image: '/Aya1-ps.jpg.jpg' },
    { id: 6, name: 'Bree', personality: 'Caregiver and lover', image: '/Bree1-ps.jpg.jpg' },
    { id: 7, name: 'Bree', personality: 'Caregiver and lover', image: '/Bree2-ps.jpgjpg.jpg' },
    { id: 8, name: 'Briana', personality: 'Caregiver and lover', image: '/Briana1-ps.jpg.jpg' },
    { id: 9, name: 'Camila', personality: 'Caregiver and lover', image: '/Camila-ps.jpg.jpg' },
    { id: 10, name: 'Claire', personality: 'Caregiver and lover', image: '/Claire-ps.jpgjpg.jpg' },
    { id: 11, name: 'Dani', personality: 'Caregiver and lover', image: '/Dani2.jpg' },
    { id: 12, name: 'Eden', personality: 'Caregiver and lover', image: '/Eden2-ps.jpgjpg.jpg' },
    { id: 13, name: 'Elara', personality: 'Caregiver and lover', image: '/Elara.jpg' },
    { id: 14, name: 'Emi', personality: 'Caregiver and lover', image: '/Emi3-ps.jpgjpg.jpg' },
    { id: 15, name: 'Emily', personality: 'Caregiver and lover', image: '/Emily2.jpg' },
    { id: 16, name: 'Emma', personality: 'Caregiver and lover', image: '/Emma2-ps.jpgjpg.jpg' },
    { id: 17, name: 'Grace', personality: 'Caregiver and lover', image: '/Grace3-ps.jpgjpg.jpg' },
    { id: 18, name: 'Harper', personality: 'Caregiver and lover', image: '/Harper-ps.jpg.jpg' },
    { id: 19, name: 'Iris', personality: 'Caregiver and lover', image: '/Iris-ps.jpgjpg.jpg' },
    { id: 20, name: 'Isabella', personality: 'Caregiver and lover', image: '/Isabella-ps.jpgjpg.jpg' },
    { id: 21, name: 'Isla', personality: 'Caregiver and lover', image: '/Isla.jpg' },
    { id: 22, name: 'Jasmine', personality: 'Caregiver and lover', image: '/Jasmine-ps.jpgjpg.jpg' },
    { id: 23, name: 'June', personality: 'Caregiver and lover', image: '/June-ps.jpgjpg.jpg' },
    { id: 24, name: 'Keira', personality: 'Caregiver and lover', image: '/Keira.jpg' },
    { id: 25, name: 'Lana', personality: 'Caregiver and lover', image: '/Lana-ps.jpg.jpg' },
    { id: 26, name: 'Leena', personality: 'Caregiver and lover', image: '/Leena1-ps.jpg.jpg' },
    { id: 27, name: 'Lila', personality: 'Caregiver and lover', image: '/Lila-ps.jpgjpg.jpg' },
    { id: 28, name: 'Lindsay', personality: 'Caregiver and lover', image: '/Lindsay1-ps.jpg.jpg' },
    { id: 29, name: 'Luna', personality: 'Caregiver and lover', image: '/Luna-ps.jpgjpg.jpg' },
    { id: 30, name: 'Lyra', personality: 'Caregiver and lover', image: '/Lyra.jpg' },
    { id: 31, name: 'Maya', personality: 'Caregiver and lover', image: '/Maya3-ps.jpgjpg.jpg' },
    { id: 32, name: 'Mina', personality: 'Caregiver and lover', image: '/Mina1-ps.jpg.jpg' },
    { id: 33, name: 'Mira', personality: 'Caregiver and lover', image: '/mira2.jpg' },
    { id: 34, name: 'Naomi', personality: 'Caregiver and lover', image: '/Naomi1-ps.jpg.jpg' },
    { id: 35, name: 'Nia', personality: 'Caregiver and lover', image: '/Nia1 First Edite.jpg' },
    { id: 36, name: 'Nina', personality: 'Caregiver and lover', image: '/Nina2-ps.jpgjpg.jpg' },
    { id: 37, name: 'Noa', personality: 'Caregiver and lover', image: '/Noa3-ps.jpgjpg.jpg' },
    { id: 38, name: 'Nova', personality: 'Caregiver and lover', image: '/Nova.jpg' },
    { id: 39, name: 'Olivia', personality: 'Caregiver and lover', image: '/Olivia2.jpg' },
    { id: 40, name: 'Priya', personality: 'Caregiver and lover', image: '/Priya.jpg' },
    { id: 41, name: 'Rachel', personality: 'Caregiver and lover', image: '/Rachel-ps.jpgjpg.jpg' },
    { id: 42, name: 'Rose', personality: 'Caregiver and lover', image: '/Rose-ps.jpgjpg.jpg' },
    { id: 43, name: 'Ruby', personality: 'Caregiver and lover', image: '/Ruby.jpg' },
    { id: 44, name: 'Sade', personality: 'Caregiver and lover', image: '/Sade2-ps.jpg.jpg' },
    { id: 45, name: 'Sage', personality: 'Caregiver and lover', image: '/Sage.jpg' },
    { id: 46, name: 'Sienna', personality: 'Caregiver and lover', image: '/Sienna2.jpg' },
    { id: 47, name: 'Sierra', personality: 'Caregiver and lover', image: '/Sierra2Sierrajpg.jpg' },
    { id: 48, name: 'Skye', personality: 'Caregiver and lover', image: '/Skye.jpg' },
    { id: 49, name: 'Sofia', personality: 'Caregiver and lover', image: '/Sofia.jpg' },
    { id: 50, name: 'Soojin', personality: 'Caregiver and lover', image: '/Soojin1-ps.jpg.jpg' },
    { id: 51, name: 'Sophie', personality: 'Caregiver and lover', image: '/Sophie2-ps.jpg.jpg' },
    { id: 52, name: 'Tessa', personality: 'Caregiver and lover', image: '/Tessa2.jpg' },
    { id: 53, name: 'Valentina', personality: 'Caregiver and lover', image: '/Valentina.jpg' },
    { id: 54, name: 'Vanessa', personality: 'Caregiver and lover', image: '/Vanessa.jpg' },
    { id: 55, name: 'Yuna', personality: 'Caregiver and lover', image: '/Yuna1.jpg' },
    { id: 57, name: 'Zara', personality: 'Caregiver and lover', image: '/Zara2jpg.jpg' },

  ])


  function shuffleProfiles(profiles) {
    return profiles
        .map(profile => ({ profile, sort: Math.random() })) // Add random sort key
        .sort((a, b) => a.sort - b.sort) // Sort based on random key
        .map(({ profile }) => profile); // Extract shuffled profiles
}

useEffect(() => {
  const shuffeled_profiles = shuffleProfiles(profiles);
  set_original_profiles(shuffeled_profiles)
}, []); // Ensure this runs only once on component mount


  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);

  const currentProfile = profiles[currentIndex];

  const swipe = (direction, name, personality, image) => {
    setDirection(direction);
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
    }, 300);
    if (direction == "right") {
      router.push(`/match?name=${name}&personality=${personality}&image=${image}&user_id=${user_id}&email=${email}`)
    }
  };

  function go_to_pricing(){
    router.push(`/pricing?user_id=${user_id}&email=${email}`)
  }

  return (
    <>
      <div className='min-h-screen'>
        <div className="flex items-center justify-center gap-3 text-pink-500 font-semibold">
          {/* <div className="w-2 h-2 rounded-full bg-pink-500" /> */}
          <svg width="19" height="32" viewBox="0 0 19 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.6331 0C7.44189 12.7343 0.921753 15.3 0.921753 24.2279C0.921753 28.7073 5.3497 32 9.6331 32C14.0127 32 18.1741 28.9204 18.1741 24.6675C18.1741 16.0975 11.8975 12.7102 9.63317 0H9.6331ZM5.33968 15.9931C3.27967 21.5573 4.9636 27.3799 9.33621 29.2074C10.4549 29.6751 11.6733 29.7757 12.8653 29.6701C4.30986 33.3378 -0.82501 23.7901 5.33946 15.993L5.33968 15.9931Z" fill="#FE506B" />
          </svg>

          <span className='mr-16'>Pink Honey</span>

        <button onClick={go_to_pricing}>
          <svg width="146" height="32" viewBox="0 0 146 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="145" height="31" rx="5.5" stroke="#FE506B" />
            <path d="M16.172 22.098C15.528 22.098 14.9493 21.986 14.436 21.762C13.932 21.5287 13.5353 21.2113 13.246 20.81C12.9567 20.3993 12.8073 19.928 12.798 19.396H14.156C14.2027 19.8533 14.3893 20.2407 14.716 20.558C15.052 20.866 15.5373 21.02 16.172 21.02C16.7787 21.02 17.2547 20.8707 17.6 20.572C17.9547 20.264 18.132 19.872 18.132 19.396C18.132 19.0227 18.0293 18.7193 17.824 18.486C17.6187 18.2527 17.362 18.0753 17.054 17.954C16.746 17.8327 16.3307 17.702 15.808 17.562C15.164 17.394 14.646 17.226 14.254 17.058C13.8713 16.89 13.54 16.6287 13.26 16.274C12.9893 15.91 12.854 15.4247 12.854 14.818C12.854 14.286 12.9893 13.8147 13.26 13.404C13.5307 12.9933 13.9087 12.676 14.394 12.452C14.8887 12.228 15.4533 12.116 16.088 12.116C17.0027 12.116 17.7493 12.3447 18.328 12.802C18.916 13.2593 19.2473 13.866 19.322 14.622H17.922C17.8753 14.2487 17.6793 13.922 17.334 13.642C16.9887 13.3527 16.5313 13.208 15.962 13.208C15.43 13.208 14.996 13.348 14.66 13.628C14.324 13.8987 14.156 14.2813 14.156 14.776C14.156 15.1307 14.254 15.42 14.45 15.644C14.6553 15.868 14.9027 16.0407 15.192 16.162C15.4907 16.274 15.906 16.4047 16.438 16.554C17.082 16.7313 17.6 16.9087 17.992 17.086C18.384 17.254 18.72 17.52 19 17.884C19.28 18.2387 19.42 18.724 19.42 19.34C19.42 19.816 19.294 20.264 19.042 20.684C18.79 21.104 18.4167 21.4447 17.922 21.706C17.4273 21.9673 16.844 22.098 16.172 22.098ZM28.0988 14.328V22H26.8248V20.866C26.5821 21.258 26.2415 21.566 25.8028 21.79C25.3735 22.0047 24.8975 22.112 24.3748 22.112C23.7775 22.112 23.2408 21.9907 22.7648 21.748C22.2888 21.496 21.9108 21.1227 21.6308 20.628C21.3601 20.1333 21.2248 19.5313 21.2248 18.822V14.328H22.4848V18.654C22.4848 19.41 22.6761 19.9933 23.0588 20.404C23.4415 20.8053 23.9641 21.006 24.6268 21.006C25.3081 21.006 25.8448 20.796 26.2368 20.376C26.6288 19.956 26.8248 19.3447 26.8248 18.542V14.328H28.0988ZM31.5239 15.756C31.7852 15.2987 32.1679 14.9253 32.6719 14.636C33.1759 14.3467 33.7499 14.202 34.3939 14.202C35.0845 14.202 35.7052 14.3653 36.2559 14.692C36.8065 15.0187 37.2405 15.4807 37.5579 16.078C37.8752 16.666 38.0339 17.352 38.0339 18.136C38.0339 18.9107 37.8752 19.6013 37.5579 20.208C37.2405 20.8147 36.8019 21.286 36.2419 21.622C35.6912 21.958 35.0752 22.126 34.3939 22.126C33.7312 22.126 33.1479 21.9813 32.6439 21.692C32.1492 21.4027 31.7759 21.034 31.5239 20.586V22H30.2499V11.64H31.5239V15.756ZM36.7319 18.136C36.7319 17.5573 36.6152 17.0533 36.3819 16.624C36.1485 16.1947 35.8312 15.868 35.4299 15.644C35.0379 15.42 34.6039 15.308 34.1279 15.308C33.6612 15.308 33.2272 15.4247 32.8259 15.658C32.4339 15.882 32.1165 16.2133 31.8739 16.652C31.6405 17.0813 31.5239 17.5807 31.5239 18.15C31.5239 18.7287 31.6405 19.2373 31.8739 19.676C32.1165 20.1053 32.4339 20.4367 32.8259 20.67C33.2272 20.894 33.6612 21.006 34.1279 21.006C34.6039 21.006 35.0379 20.894 35.4299 20.67C35.8312 20.4367 36.1485 20.1053 36.3819 19.676C36.6152 19.2373 36.7319 18.724 36.7319 18.136ZM42.4268 22.126C41.8388 22.126 41.3115 22.028 40.8448 21.832C40.3781 21.6267 40.0095 21.3467 39.7388 20.992C39.4681 20.628 39.3188 20.2127 39.2908 19.746H40.6068C40.6441 20.1287 40.8215 20.4413 41.1388 20.684C41.4655 20.9267 41.8901 21.048 42.4128 21.048C42.8981 21.048 43.2808 20.9407 43.5608 20.726C43.8408 20.5113 43.9808 20.2407 43.9808 19.914C43.9808 19.578 43.8315 19.3307 43.5328 19.172C43.2341 19.004 42.7721 18.8407 42.1468 18.682C41.5775 18.5327 41.1108 18.3833 40.7468 18.234C40.3921 18.0753 40.0841 17.8467 39.8228 17.548C39.5708 17.24 39.4448 16.8387 39.4448 16.344C39.4448 15.952 39.5615 15.5927 39.7948 15.266C40.0281 14.9393 40.3595 14.6827 40.7888 14.496C41.2181 14.3 41.7081 14.202 42.2588 14.202C43.1081 14.202 43.7941 14.4167 44.3168 14.846C44.8395 15.2753 45.1195 15.8633 45.1568 16.61H43.8828C43.8548 16.2087 43.6915 15.8867 43.3928 15.644C43.1035 15.4013 42.7115 15.28 42.2168 15.28C41.7595 15.28 41.3955 15.378 41.1248 15.574C40.8541 15.77 40.7188 16.0267 40.7188 16.344C40.7188 16.596 40.7981 16.806 40.9568 16.974C41.1248 17.1327 41.3301 17.2633 41.5728 17.366C41.8248 17.4593 42.1701 17.5667 42.6088 17.688C43.1595 17.8373 43.6075 17.9867 43.9528 18.136C44.2981 18.276 44.5921 18.4907 44.8348 18.78C45.0868 19.0693 45.2175 19.4473 45.2268 19.914C45.2268 20.334 45.1101 20.712 44.8768 21.048C44.6435 21.384 44.3121 21.65 43.8828 21.846C43.4628 22.0327 42.9775 22.126 42.4268 22.126ZM46.5493 18.15C46.5493 17.3567 46.7079 16.666 47.0253 16.078C47.3426 15.4807 47.7813 15.0187 48.3413 14.692C48.9106 14.3653 49.5593 14.202 50.2873 14.202C51.2299 14.202 52.0046 14.4307 52.6113 14.888C53.2273 15.3453 53.6333 15.98 53.8293 16.792H52.4573C52.3266 16.3253 52.0699 15.9567 51.6873 15.686C51.3139 15.4153 50.8473 15.28 50.2873 15.28C49.5593 15.28 48.9713 15.532 48.5233 16.036C48.0753 16.5307 47.8513 17.2353 47.8513 18.15C47.8513 19.074 48.0753 19.788 48.5233 20.292C48.9713 20.796 49.5593 21.048 50.2873 21.048C50.8473 21.048 51.3139 20.9173 51.6873 20.656C52.0606 20.3947 52.3173 20.0213 52.4573 19.536H53.8293C53.6239 20.32 53.2133 20.95 52.5973 21.426C51.9813 21.8927 51.2113 22.126 50.2873 22.126C49.5593 22.126 48.9106 21.9627 48.3413 21.636C47.7813 21.3093 47.3426 20.8473 47.0253 20.25C46.7079 19.6527 46.5493 18.9527 46.5493 18.15ZM56.8032 15.574C57.0272 15.1353 57.3445 14.7947 57.7552 14.552C58.1752 14.3093 58.6838 14.188 59.2812 14.188V15.504H58.9452C57.5172 15.504 56.8032 16.2787 56.8032 17.828V22H55.5292V14.328H56.8032V15.574ZM61.4098 13.082C61.1672 13.082 60.9618 12.998 60.7938 12.83C60.6258 12.662 60.5418 12.4567 60.5418 12.214C60.5418 11.9713 60.6258 11.766 60.7938 11.598C60.9618 11.43 61.1672 11.346 61.4098 11.346C61.6432 11.346 61.8392 11.43 61.9978 11.598C62.1658 11.766 62.2498 11.9713 62.2498 12.214C62.2498 12.4567 62.1658 12.662 61.9978 12.83C61.8392 12.998 61.6432 13.082 61.4098 13.082ZM62.0258 14.328V22H60.7518V14.328H62.0258ZM65.4711 15.756C65.7325 15.2987 66.1151 14.9253 66.6191 14.636C67.1231 14.3467 67.6971 14.202 68.3411 14.202C69.0318 14.202 69.6525 14.3653 70.2031 14.692C70.7538 15.0187 71.1878 15.4807 71.5051 16.078C71.8225 16.666 71.9811 17.352 71.9811 18.136C71.9811 18.9107 71.8225 19.6013 71.5051 20.208C71.1878 20.8147 70.7491 21.286 70.1891 21.622C69.6385 21.958 69.0225 22.126 68.3411 22.126C67.6785 22.126 67.0951 21.9813 66.5911 21.692C66.0965 21.4027 65.7231 21.034 65.4711 20.586V22H64.1971V11.64H65.4711V15.756ZM70.6791 18.136C70.6791 17.5573 70.5625 17.0533 70.3291 16.624C70.0958 16.1947 69.7785 15.868 69.3771 15.644C68.9851 15.42 68.5511 15.308 68.0751 15.308C67.6085 15.308 67.1745 15.4247 66.7731 15.658C66.3811 15.882 66.0638 16.2133 65.8211 16.652C65.5878 17.0813 65.4711 17.5807 65.4711 18.15C65.4711 18.7287 65.5878 19.2373 65.8211 19.676C66.0638 20.1053 66.3811 20.4367 66.7731 20.67C67.1745 20.894 67.6085 21.006 68.0751 21.006C68.5511 21.006 68.9851 20.894 69.3771 20.67C69.7785 20.4367 70.0958 20.1053 70.3291 19.676C70.5625 19.2373 70.6791 18.724 70.6791 18.136ZM80.6581 17.87C80.6581 18.1127 80.6441 18.3693 80.6161 18.64H74.4841C74.5307 19.396 74.7874 19.9887 75.2541 20.418C75.7301 20.838 76.3041 21.048 76.9761 21.048C77.5267 21.048 77.9841 20.922 78.3481 20.67C78.7214 20.4087 78.9827 20.0633 79.1321 19.634H80.5041C80.2987 20.3713 79.8881 20.9733 79.2721 21.44C78.6561 21.8973 77.8907 22.126 76.9761 22.126C76.2481 22.126 75.5947 21.9627 75.0161 21.636C74.4467 21.3093 73.9987 20.8473 73.6721 20.25C73.3454 19.6433 73.1821 18.9433 73.1821 18.15C73.1821 17.3567 73.3407 16.6613 73.6581 16.064C73.9754 15.4667 74.4187 15.0093 74.9881 14.692C75.5667 14.3653 76.2294 14.202 76.9761 14.202C77.7041 14.202 78.3481 14.3607 78.9081 14.678C79.4681 14.9953 79.8974 15.434 80.1961 15.994C80.5041 16.5447 80.6581 17.17 80.6581 17.87ZM79.3421 17.604C79.3421 17.1187 79.2347 16.7033 79.0201 16.358C78.8054 16.0033 78.5114 15.7373 78.1381 15.56C77.7741 15.3733 77.3681 15.28 76.9201 15.28C76.2761 15.28 75.7254 15.4853 75.2681 15.896C74.8201 16.3067 74.5634 16.876 74.4981 17.604H79.3421Z" fill="white" />
            <path d="M86.1393 21.124C87.1553 20.308 87.9513 19.64 88.5273 19.12C89.1033 18.592 89.5873 18.044 89.9793 17.476C90.3793 16.9 90.5793 16.336 90.5793 15.784C90.5793 15.264 90.4513 14.856 90.1953 14.56C89.9473 14.256 89.5433 14.104 88.9833 14.104C88.4393 14.104 88.0153 14.276 87.7113 14.62C87.4153 14.956 87.2553 15.408 87.2313 15.976H86.1753C86.2073 15.08 86.4793 14.388 86.9913 13.9C87.5033 13.412 88.1633 13.168 88.9713 13.168C89.7953 13.168 90.4473 13.396 90.9273 13.852C91.4153 14.308 91.6593 14.936 91.6593 15.736C91.6593 16.4 91.4593 17.048 91.0593 17.68C90.6673 18.304 90.2193 18.856 89.7153 19.336C89.2113 19.808 88.5673 20.36 87.7833 20.992H91.9113V21.904H86.1393V21.124ZM93.1737 17.572C93.1737 16.196 93.3977 15.124 93.8457 14.356C94.2937 13.58 95.0777 13.192 96.1977 13.192C97.3097 13.192 98.0897 13.58 98.5377 14.356C98.9857 15.124 99.2097 16.196 99.2097 17.572C99.2097 18.972 98.9857 20.06 98.5377 20.836C98.0897 21.612 97.3097 22 96.1977 22C95.0777 22 94.2937 21.612 93.8457 20.836C93.3977 20.06 93.1737 18.972 93.1737 17.572ZM98.1297 17.572C98.1297 16.876 98.0817 16.288 97.9857 15.808C97.8977 15.32 97.7097 14.928 97.4217 14.632C97.1417 14.336 96.7337 14.188 96.1977 14.188C95.6537 14.188 95.2377 14.336 94.9497 14.632C94.6697 14.928 94.4817 15.32 94.3857 15.808C94.2977 16.288 94.2537 16.876 94.2537 17.572C94.2537 18.292 94.2977 18.896 94.3857 19.384C94.4817 19.872 94.6697 20.264 94.9497 20.56C95.2377 20.856 95.6537 21.004 96.1977 21.004C96.7337 21.004 97.1417 20.856 97.4217 20.56C97.7097 20.264 97.8977 19.872 97.9857 19.384C98.0817 18.896 98.1297 18.292 98.1297 17.572ZM100.469 15.28C100.469 14.736 100.633 14.304 100.961 13.984C101.289 13.656 101.709 13.492 102.221 13.492C102.733 13.492 103.153 13.656 103.481 13.984C103.809 14.304 103.973 14.736 103.973 15.28C103.973 15.832 103.809 16.272 103.481 16.6C103.153 16.92 102.733 17.08 102.221 17.08C101.709 17.08 101.289 16.92 100.961 16.6C100.633 16.272 100.469 15.832 100.469 15.28ZM107.477 13.624L102.617 22H101.537L106.397 13.624H107.477ZM102.221 14.164C101.949 14.164 101.733 14.26 101.573 14.452C101.421 14.636 101.345 14.912 101.345 15.28C101.345 15.648 101.421 15.928 101.573 16.12C101.733 16.312 101.949 16.408 102.221 16.408C102.493 16.408 102.709 16.312 102.869 16.12C103.029 15.92 103.109 15.64 103.109 15.28C103.109 14.912 103.029 14.636 102.869 14.452C102.709 14.26 102.493 14.164 102.221 14.164ZM105.065 20.344C105.065 19.792 105.229 19.356 105.557 19.036C105.885 18.708 106.305 18.544 106.817 18.544C107.329 18.544 107.745 18.708 108.065 19.036C108.393 19.356 108.557 19.792 108.557 20.344C108.557 20.888 108.393 21.324 108.065 21.652C107.745 21.98 107.329 22.144 106.817 22.144C106.305 22.144 105.885 21.984 105.557 21.664C105.229 21.336 105.065 20.896 105.065 20.344ZM106.805 19.228C106.533 19.228 106.317 19.324 106.157 19.516C105.997 19.7 105.917 19.976 105.917 20.344C105.917 20.704 105.997 20.98 106.157 21.172C106.317 21.356 106.533 21.448 106.805 21.448C107.077 21.448 107.293 21.356 107.453 21.172C107.613 20.98 107.693 20.704 107.693 20.344C107.693 19.976 107.613 19.7 107.453 19.516C107.293 19.324 107.077 19.228 106.805 19.228ZM116.986 22.084C116.21 22.084 115.502 21.904 114.862 21.544C114.222 21.176 113.714 20.668 113.338 20.02C112.97 19.364 112.786 18.628 112.786 17.812C112.786 16.996 112.97 16.264 113.338 15.616C113.714 14.96 114.222 14.452 114.862 14.092C115.502 13.724 116.21 13.54 116.986 13.54C117.77 13.54 118.482 13.724 119.122 14.092C119.762 14.452 120.266 14.956 120.634 15.604C121.002 16.252 121.186 16.988 121.186 17.812C121.186 18.636 121.002 19.372 120.634 20.02C120.266 20.668 119.762 21.176 119.122 21.544C118.482 21.904 117.77 22.084 116.986 22.084ZM116.986 21.136C117.57 21.136 118.094 21 118.558 20.728C119.03 20.456 119.398 20.068 119.662 19.564C119.934 19.06 120.07 18.476 120.07 17.812C120.07 17.14 119.934 16.556 119.662 16.06C119.398 15.556 119.034 15.168 118.57 14.896C118.106 14.624 117.578 14.488 116.986 14.488C116.394 14.488 115.866 14.624 115.402 14.896C114.938 15.168 114.57 15.556 114.298 16.06C114.034 16.556 113.902 17.14 113.902 17.812C113.902 18.476 114.034 19.06 114.298 19.564C114.57 20.068 114.938 20.456 115.402 20.728C115.874 21 116.402 21.136 116.986 21.136ZM127.355 13.636V14.524H123.719V17.344H126.671V18.232H123.719V22H122.627V13.636H127.355ZM133.402 13.636V14.524H129.766V17.344H132.718V18.232H129.766V22H128.674V13.636H133.402Z" fill="#FE506B" />
          </svg>
          </button>
        </div>


        <div className="py-12">
          <div className="max-w-sm mx-auto relative h-[600px]">
            <AnimatePresence>
              <motion.div
                key={currentProfile.id}
                initial={direction ? {
                  x: direction === 'right' ? -300 : direction === 'left' ? 300 : 0
                } : false}
                animate={{ x: 0, rotate: 0 }}
                exit={{
                  x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0,
                  rotate: direction === 'right' ? 20 : direction === 'left' ? -20 : 0
                }}
                transition={{ duration: 0.3 }}
                className="absolute w-full"
              >
                {/* Card Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-red-500">
                  {/* Image */}
                  <img
                    src={currentProfile.image}
                    alt="Profile"
                    className="w-full h-[600px] object-cover "
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent">
                    {/* Name */}
                    <div className="absolute bottom-20 left-4">
                      <h2 className="text-white text-2xl font-semibold">
                        {currentProfile.name}
                      </h2>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-6">
                      <button
                        onClick={() => swipe('left')}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 27.6667C13.4373 27.6632 10.9806 26.6436 9.16851 24.8315C7.35642 23.0194 6.33684 20.5627 6.33331 18C6.33331 17.7348 6.43867 17.4804 6.62621 17.2929C6.81374 17.1054 7.0681 17 7.33331 17C7.59853 17 7.85288 17.1054 8.04042 17.2929C8.22796 17.4804 8.33331 17.7348 8.33331 18C8.33331 19.5163 8.78296 20.9986 9.62538 22.2594C10.4678 23.5202 11.6652 24.5028 13.0661 25.0831C14.467 25.6634 16.0085 25.8152 17.4957 25.5194C18.9829 25.2235 20.3489 24.4934 21.4211 23.4212C22.4933 22.349 23.2235 20.9829 23.5193 19.4957C23.8152 18.0085 23.6633 16.467 23.0831 15.0661C22.5028 13.6652 21.5201 12.4678 20.2594 11.6254C18.9986 10.783 17.5163 10.3333 16 10.3333H12.6666C12.4014 10.3333 12.1471 10.228 11.9595 10.0405C11.772 9.85291 11.6666 9.59856 11.6666 9.33334C11.6666 9.06813 11.772 8.81377 11.9595 8.62624C12.1471 8.4387 12.4014 8.33334 12.6666 8.33334H16C18.5637 8.33334 21.0225 9.35179 22.8353 11.1646C24.6482 12.9775 25.6666 15.4363 25.6666 18C25.6666 20.5638 24.6482 23.0225 22.8353 24.8354C21.0225 26.6482 18.5637 27.6667 16 27.6667Z" fill="#FE506B" />
                          <path d="M16 14.3333C15.8686 14.3339 15.7384 14.3083 15.6171 14.2579C15.4957 14.2076 15.3856 14.1335 15.2933 14.04L11.2933 10.04C11.106 9.85249 11.0009 9.59833 11.0009 9.33332C11.0009 9.06832 11.106 8.81416 11.2933 8.62666L15.2933 4.62666C15.3849 4.52841 15.4953 4.44961 15.6179 4.39495C15.7406 4.34029 15.873 4.3109 16.0073 4.30854C16.1415 4.30617 16.2749 4.33087 16.3994 4.38116C16.524 4.43146 16.6371 4.50632 16.732 4.60127C16.827 4.69623 16.9018 4.80934 16.9521 4.93386C17.0024 5.05838 17.0271 5.19175 17.0248 5.32602C17.0224 5.46029 16.993 5.59271 16.9383 5.71538C16.8837 5.83804 16.8049 5.94844 16.7066 6.03999L13.4133 9.33332L16.7066 12.6267C16.8939 12.8142 16.9991 13.0683 16.9991 13.3333C16.9991 13.5983 16.8939 13.8525 16.7066 14.04C16.6143 14.1335 16.5042 14.2076 16.3829 14.2579C16.2615 14.3083 16.1314 14.3339 16 14.3333Z" fill="#FE506B" />
                        </svg>

                      </button>
                      {/* Dislike Button */}
                      <button
                        onClick={() => swipe('left')}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M16.7907 31.0107L16.776 31.0133L16.6813 31.06L16.6547 31.0653L16.636 31.06L16.5413 31.0133C16.5271 31.0089 16.5165 31.0111 16.5093 31.02L16.504 31.0333L16.4813 31.604L16.488 31.6307L16.5013 31.648L16.64 31.7467L16.66 31.752L16.676 31.7467L16.8147 31.648L16.8307 31.6267L16.836 31.604L16.8133 31.0347C16.8098 31.0204 16.8022 31.0124 16.7907 31.0107ZM17.144 30.86L17.1267 30.8627L16.88 30.9867L16.8667 31L16.8627 31.0147L16.8867 31.588L16.8933 31.604L16.904 31.6133L17.172 31.7373C17.1889 31.7418 17.2018 31.7382 17.2107 31.7267L17.216 31.708L17.1707 30.8893C17.1662 30.8733 17.1573 30.8635 17.144 30.86ZM16.1907 30.8627C16.1848 30.8591 16.1778 30.8579 16.1711 30.8594C16.1644 30.8609 16.1585 30.8649 16.1547 30.8707L16.1467 30.8893L16.1013 31.708C16.1022 31.724 16.1098 31.7347 16.124 31.74L16.144 31.7373L16.412 31.6133L16.4253 31.6027L16.4307 31.588L16.4533 31.0147L16.4493 30.9987L16.436 30.9853L16.1907 30.8627Z" fill="#FE506B" />
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M16 18.8293L23.0707 25.9C23.4459 26.2752 23.9547 26.486 24.4853 26.486C25.0159 26.486 25.5248 26.2752 25.9 25.9C26.2752 25.5248 26.486 25.0159 26.486 24.4853C26.486 23.9547 26.2752 23.4459 25.9 23.0707L18.8267 16L25.8987 8.92933C26.0844 8.74355 26.2316 8.52302 26.3321 8.28032C26.4326 8.03763 26.4842 7.77752 26.4842 7.51486C26.4841 7.25219 26.4323 6.99211 26.3317 6.74946C26.2312 6.50681 26.0838 6.28635 25.898 6.10066C25.7122 5.91497 25.4917 5.76769 25.249 5.66723C25.0063 5.56677 24.7462 5.5151 24.4835 5.51516C24.2209 5.51522 23.9608 5.56702 23.7181 5.66759C23.4755 5.76817 23.255 5.91555 23.0693 6.10133L16 13.172L8.92933 6.10133C8.74493 5.91022 8.52431 5.75776 8.28035 5.65282C8.0364 5.54789 7.77398 5.4926 7.50843 5.49017C7.24287 5.48773 6.97949 5.53821 6.73365 5.63866C6.48781 5.7391 6.26444 5.88751 6.07657 6.0752C5.88869 6.2629 5.74008 6.48613 5.6394 6.73188C5.53873 6.97762 5.488 7.24095 5.49018 7.50651C5.49236 7.77207 5.54741 8.03453 5.65211 8.27859C5.75681 8.52265 5.90907 8.74341 6.1 8.92799L13.1733 16L6.10133 23.072C5.9104 23.2566 5.75815 23.4773 5.65344 23.7214C5.54874 23.9655 5.49369 24.2279 5.49151 24.4935C5.48933 24.759 5.54006 25.0224 5.64074 25.2681C5.74141 25.5139 5.89003 25.7371 6.0779 25.9248C6.26577 26.1125 6.48914 26.2609 6.73498 26.3613C6.98082 26.4618 7.2442 26.5123 7.50976 26.5098C7.77532 26.5074 8.03773 26.4521 8.28169 26.3472C8.52565 26.2422 8.74626 26.0898 8.93067 25.8987L16 18.8293Z" fill="#FE506B" />
                        </svg>

                        {/* <X className="w-8 h-8 text-gray-600" /> */}
                      </button>

                      {/* Like Button */}
                      <button
                        onClick={() => swipe('right', currentProfile.name, currentProfile.personality, currentProfile.image)}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-brand-pink shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 39.1417L19.3417 36.7217C9.89999 28.16 3.66666 22.495 3.66666 15.5833C3.66666 9.91833 8.10332 5.5 13.75 5.5C16.94 5.5 20.0017 6.985 22 9.31333C23.9983 6.985 27.06 5.5 30.25 5.5C35.8967 5.5 40.3333 9.91833 40.3333 15.5833C40.3333 22.495 34.1 28.16 24.6583 36.7217L22 39.1417Z" fill="white" />
                        </svg>

                        {/* <Heart className="w-8 h-8 text-white" /> */}
                      </button>

                      {/* Favorite Button */}
                      <button
                        onClick={() => swipe('up')}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.9907 9.78666L2.48399 11.02L2.33333 11.0507C2.10525 11.1112 1.89732 11.2312 1.73078 11.3984C1.56425 11.5656 1.44506 11.774 1.38541 12.0023C1.32575 12.2306 1.32776 12.4707 1.39123 12.698C1.4547 12.9252 1.57735 13.1316 1.74666 13.296L7.90933 19.2947L6.45599 27.768L6.43866 27.9147C6.4247 28.1506 6.47368 28.3859 6.58059 28.5967C6.68751 28.8074 6.84851 28.9859 7.04711 29.114C7.24571 29.2421 7.47478 29.315 7.71086 29.3255C7.94694 29.3359 8.18155 29.2834 8.39066 29.1733L15.9987 25.1733L23.5893 29.1733L23.7227 29.2347C23.9427 29.3213 24.1819 29.3479 24.4157 29.3117C24.6494 29.2754 24.8693 29.1776 25.0528 29.0283C25.2363 28.8791 25.3767 28.6837 25.4598 28.4622C25.5428 28.2407 25.5654 28.0011 25.5253 27.768L24.0707 19.2947L30.236 13.2947L30.34 13.1813C30.4886 12.9983 30.586 12.7793 30.6223 12.5464C30.6586 12.3135 30.6326 12.0752 30.5468 11.8556C30.461 11.6361 30.3186 11.4432 30.134 11.2967C29.9494 11.1501 29.7293 11.0551 29.496 11.0213L20.9893 9.78666L17.1867 2.07999C17.0766 1.8567 16.9063 1.66867 16.6949 1.53719C16.4835 1.40571 16.2396 1.33603 15.9907 1.33603C15.7417 1.33603 15.4978 1.40571 15.2864 1.53719C15.075 1.66867 14.9047 1.8567 14.7947 2.07999L10.9907 9.78666Z" fill="#672653" />
                        </svg>

                        {/* <Star className="w-8 h-8 text-purple-500" /> */}
                      </button>
                    </div>
                    
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>


          </div>
        </div>


        <div className="sticky bottom-2 left-0 right-0 flex justify-center items-center gap-6">
          {/* Dislike Button */}
          <button
            className="w-14 h-14 flex items-center justify-center rounded-full  shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9.49902" y="4.49756" width="13" height="18" rx="2" fill="#E94057" stroke="#F3F3F3" />
              <rect x="0.391602" y="4.48901" width="13" height="18" rx="2" transform="rotate(-15 0.391602 4.48901)" fill="#E94057" stroke="#F3F3F3" />
            </svg>

            {/* <X className="w-8 h-8 text-gray-600" /> */}
          </button>

          {/* Like Button */}
          <button
            className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12C22 17.5229 17.5229 22 12 22C9.01325 22 2 22 2 22C2 22 2 14.5361 2 12C2 6.47715 6.47715 2 12 2C17.5229 2 22 6.47715 22 12Z" fill="#ADAFBB" stroke="#ADAFBB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9H16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 13H16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 17H12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            {/* <Heart className="w-8 h-8 text-pink-500" /> */}
          </button>

          {/* Favorite Button */}
          <button
            className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 10C13.933 10 15.5 8.433 15.5 6.5C15.5 4.56701 13.933 3 12 3C10.067 3 8.5 4.56701 8.5 6.5C8.5 8.433 10.067 10 12 10Z" fill="#ADAFBB" stroke="#ADAFBB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3 20.4V21H21V20.4C21 18.1598 21 17.0397 20.5641 16.184C20.1806 15.4314 19.5686 14.8195 18.816 14.436C17.9603 14 16.8402 14 14.6 14H9.4C7.1598 14 6.0397 14 5.18405 14.436C4.43139 14.8195 3.81947 15.4314 3.43598 16.184C3 17.0397 3 18.1598 3 20.4Z" fill="#ADAFBB" stroke="#ADAFBB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            {/* <Star className="w-8 h-8 text-purple-500" /> */}
          </button>

          <button
            className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg width="72" height="48" viewBox="0 0 72 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="72" height="48" rx="6" fill="url(#paint0_linear_11_1446)" />
              <path d="M42.2152 14.5714C42.3169 14.5714 42.4172 14.5954 42.5077 14.6416C42.5983 14.6878 42.6767 14.7548 42.7363 14.8372L42.7826 14.9117L46.2172 21.3514L46.2541 21.4389L46.2635 21.4714L46.2781 21.5374L46.2866 21.6129L46.2849 21.6986L46.2866 21.6429C46.2858 21.7299 46.2683 21.816 46.2352 21.8966L46.2095 21.948L46.1752 22.0046L46.1306 22.0637L36.5143 33.1757C36.432 33.2857 36.3157 33.3655 36.1835 33.4029L36.1338 33.4149L36.0506 33.4269L36.0001 33.4286L35.9143 33.4226L35.8406 33.4089L35.7523 33.3797L35.7301 33.3694C35.6507 33.3342 35.5799 33.2821 35.5226 33.2169L25.8618 22.0517L25.8086 21.9772L25.7675 21.8974L25.7375 21.8117L25.7178 21.7003V21.5906L25.7306 21.5057L25.7392 21.4714L25.7675 21.39L25.7915 21.3412L29.2201 14.9126C29.2678 14.823 29.3362 14.746 29.4195 14.6879C29.5027 14.6298 29.5986 14.5922 29.6992 14.5783L29.7858 14.5714H42.2152ZM39.3489 22.2857H32.6503L36.0018 30.9943L39.3489 22.2857ZM31.2746 22.2857H27.7629L34.0826 29.5869L31.2746 22.2857ZM44.2363 22.2857H40.7281L37.9226 29.5809L44.2363 22.2857ZM32.5929 15.8563H30.1715L27.4286 21H31.2206L32.5929 15.8563ZM38.0786 15.8563H33.9232L32.5518 21H39.4492L38.0786 15.8563ZM41.8295 15.8563H39.4081L40.7803 21H44.5715L41.8295 15.8563Z" fill="white" />
              <defs>
                <linearGradient id="paint0_linear_11_1446" x1="36" y1="0" x2="36" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0.305" stop-color="#121212" stop-opacity="0.52" />
                  <stop offset="1" stop-color="#FE506B" stop-opacity="0.45" />
                </linearGradient>
              </defs>
            </svg>



            {/* <Star className="w-8 h-8 text-purple-500" /> */}
          </button>
        </div>
      </div>

     

    </>

  );
}