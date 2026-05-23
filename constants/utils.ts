import arrowDown from "@/assets/icons/arrow-down.png";
import arrowUp from "@/assets/icons/arrow-up.png";
import backArrow from "@/assets/icons/back-arrow.png";
import apple from "@/assets/icons/apple.png"
import chat from "@/assets/icons/chat.png";
import checkmark from "@/assets/icons/check.png";
import close from "@/assets/icons/close.png";
import trips from "@/assets/icons/trips.png"
import dollar from "@/assets/icons/dollar.png";
import email from "@/assets/icons/email.png";
import explore from "@/assets/icons/explore.png"
import eyecross from "@/assets/icons/eyecross.png";
import google from "@/assets/icons/google.png";
import home from "@/assets/icons/home.png";
import list from "@/assets/icons/list.png";
import lock from "@/assets/icons/lock.png";
import map from "@/assets/icons/map.png";
import logo from "@/assets/images/logo.png"
import logohor from "@/assets/images/logo_hor.png"
import marker from "@/assets/icons/marker.png";
import out from "@/assets/icons/out.png";
import person from "@/assets/icons/person.png";
import pin from "@/assets/icons/pin.png";
import point from "@/assets/icons/point.png";
import profile from "@/assets/icons/profile.png";
import search from "@/assets/icons/search.png";
import selectedMarker from "@/assets/icons/selected-marker.png";
import star from "@/assets/icons/star.png";
import target from "@/assets/icons/target.png";
import to from "@/assets/icons/to.png";
import check from "@/assets/images/check.png";
import getStarted from "@/assets/images/get-started.png";
import message from "@/assets/images/message.png";
import noResult from "@/assets/images/no-result.png";
import onboarding1 from "@/assets/images/onboarding1.png";
import onboarding2 from "@/assets/images/onboarding2.png";
import onboarding3 from "@/assets/images/onboarding3.png";
import signUpCar from "@/assets/images/signup-car.png";
import wallet from "@/assets/icons/wallet.png"
import { ImageSourcePropType } from "react-native";

export const images = {
    onboarding1,
    onboarding2,
    onboarding3,
    getStarted,
    signUpCar,
    check,
    noResult,
    message,
    logo,
    logohor
};

export const icons = {
    arrowDown,
    arrowUp,
    apple,
    backArrow,
    chat,
    checkmark,
    wallet,
    explore,
    close,
    dollar,
    trips,
    email,
    eyecross,
    google,
    home,
    list,
    lock,
    map,
    marker,
    out,
    person,
    pin,
    point,
    profile,
    search,
    selectedMarker,
    star,
    target,
    to,
};

export const onboarding: Onboarding[] = [
    {
        id: 1,
        title: "Request a ride instantly",
        description: "Enter your destination, review upfront pricing, and connect with a nearby driver in seconds.\nNo guesswork, just moving.",
        image: images.onboarding1,
    },
    {
        id: 2,
        title: "Track your journey live",
        description: "Follow your driver on the map, verify their vehicle details, and share your trip status with friends for added peace of mind.",
        image: images.onboarding2,
    },
    {
        id: 3,
        title: "Seamless, secure payments",
        description: "Arrive safely and pay exactly how you want. Choose between your in-app wallet, card, or cash with zero hidden fees.",
        image: images.onboarding3,
    },
];

export const data = {
    onboarding,
};

declare interface Onboarding {
    id: number,
    title: string,
    description: string,
    image: ImageSourcePropType
}

export const rideStatusColors = {
  searching: "bg-yellow-50 text-yellow-600",
  accepted: "bg-blue-50 text-blue-600",
  arrived: "bg-purple-50 text-purple-600",
  in_transit: "bg-orange-50 text-orange-600",
  completed: "bg-green-50 text-green-600",
  canceled: "bg-red-50 text-red-600",
} as const;

export const paymentStatusColors = {
  pending: "bg-yellow-50 text-yellow-600",
  paid: "bg-green-50 text-green-600",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-purple-50 text-purple-600",
} as const;