import { LoadScriptNext } from "@react-google-maps/api";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places", "geometry"];
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY!;
export const MapLoader = ({ children }: { children: React.ReactElement}) => {
  return (
    <LoadScriptNext googleMapsApiKey={apiKey} libraries={libraries}>
      {children}
    </LoadScriptNext>
  );
};
