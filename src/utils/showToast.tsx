import { ToastAndroid } from "react-native";

export default function showToast(message: string) {
  ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.TOP);
}
