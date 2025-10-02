export const initialState = {
  count: 30,
  colorMode: "single", // "single" | "random"
  color: "white",
  colors: ["#fff", "#dbeafe", "#c7f9cc", "#ffe6f0", "#fff4cc"],
  durationMin: 10000,
  durationMax: 17000,
};

export function floatiesReducer(state, action) {
  switch (action.type) {
    case "SET_COUNT":
      return { ...state, count: action.payload };
    case "SET_COLOR":
      return { ...state, color: action.payload, colorMode: "single" };
    case "SET_COLOR_MODE":
      return {
        ...state,
        colorMode: action.payload.mode,
        colors: action.payload.colors || state.colors,
      };
    case "SET_SPEED":
      return {
        ...state,
        durationMin: action.payload.min,
        durationMax: action.payload.max,
      };
    default:
      return state;
  }
}
