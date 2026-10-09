import { useRef, useState } from "react";
import { StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from "react-native";
import Svg, { Path } from "react-native-svg";

import type { Signature } from "../lib/types";
import { colors, fonts, radius } from "../theme";

type Props = {
  value: Signature | null;
  onChange: (sig: Signature | null) => void;
  /** Called with true while the user draws. Use it to stop the parent ScrollView. */
  onDrawing?: (drawing: boolean) => void;
  placeholder: string;
};

const HEIGHT = 180;

function round(n: number): string {
  return n.toFixed(1);
}

export function SignaturePad({ value, onChange, onDrawing, placeholder }: Props) {
  const [width, setWidth] = useState(300);
  const [current, setCurrent] = useState("");
  // The stroke being drawn. A ref, so fast move events do not wait for a render.
  const path = useRef("");

  function point(e: GestureResponderEvent): string {
    return `${round(e.nativeEvent.locationX)} ${round(e.nativeEvent.locationY)}`;
  }

  function start(e: GestureResponderEvent) {
    onDrawing?.(true);
    path.current = `M${point(e)}`;
    setCurrent(path.current);
  }

  function move(e: GestureResponderEvent) {
    path.current += ` L${point(e)}`;
    setCurrent(path.current);
  }

  function finish() {
    onDrawing?.(false);
    const d = path.current;
    path.current = "";
    setCurrent("");
    if (!d.includes("L")) return; // a tap, not a stroke
    onChange({ paths: [...(value?.paths ?? []), d], width, height: HEIGHT });
  }

  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));
  const paths = value?.paths ?? [];

  return (
    <View
      style={styles.box}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={start}
      onResponderMove={move}
      onResponderRelease={finish}
      onResponderTerminate={finish}
    >
      {paths.length === 0 && !current ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Text style={styles.placeholder}>{placeholder}</Text>
        </View>
      ) : null}
      <Svg width={width} height={HEIGHT} pointerEvents="none">
        {paths.map((d, i) => (
          <Path key={i} d={d} stroke={colors.text} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {current ? <Path d={current} stroke={colors.text} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: HEIGHT,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C7D2E3",
    borderRadius: radius.md,
    backgroundColor: "#FBFCFE",
    overflow: "hidden",
  },
  placeholder: { position: "absolute", alignSelf: "center", top: HEIGHT / 2 - 10, color: colors.placeholder, fontSize: 16, fontFamily: fonts.medium },
});
