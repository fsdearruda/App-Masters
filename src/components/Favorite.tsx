import React, { useState, useContext, useMemo, useEffect } from "react";
import { useRouter } from "next/router";

import { Heart } from "phosphor-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/services/firebaseClient";
import { AuthContext } from "@/contexts/AuthContext";

type FavoriteProps = {
  value?: boolean;
  id: number;
};

const Favorite = ({ value, id }: FavoriteProps) => {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [isMobile, setMobile] = useState(false);
  const [isOnFavorites, setIsOnFavorites] = useState(value);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    setIsOnFavorites(value);
  }, [value]);

  useEffect(() => {
    if (window.innerWidth < 640) setMobile(true);

    function handleResize() {
      setMobile(window.innerWidth < 640);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = async () => {
    if (!user) return router.push("/auth");

    try {
      const docRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(docRef);
      if (!userDoc.exists()) return;
      const newFavorites = {
        ...userDoc.data()?.favorites,
        [id]: !isOnFavorites,
      };
      updateDoc(docRef, {
        favorites: newFavorites,
      });
      setIsOnFavorites((prev) => !prev);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Heart
      className={`cursor-pointer transition-all duration-300 hover:scale-105 ease-in ${
        !isOnFavorites && "sm:hover:animate-pulse"
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={handleClick}
      weight={isOnFavorites || (!isMobile && hovering) ? "fill" : undefined}
      fillOpacity={!isMobile && hovering && !isOnFavorites ? 0.7 : undefined}
      fill={!!user ? "red" : "gray"}
      color={!!user ? "white" : "gray"}
      size={24}
    />
  );
};

export default Favorite;
