
import React, { useMemo, useRef, useEffect, useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;          // 0.5 por defecto
  itemWidth?: number;     // 84 por defecto
  glassWidth?: number;    // 300 por defecto
  glassHeight?: number;   // 140 por defecto
  showReadout?: boolean;  // muestra “display digital”
};

const DEFAULTS = { min: 20, max: 300, step: 0.5, itemWidth: 84, glassWidth: 300, glassHeight: 140 };

function AutoRepeatPressable({ children, onStep, delay = 350, interval = 70 }:{
  children: React.ReactNode; onStep: () => void; delay?: number; interval?: number;
}) {
  const timer = React.useRef<NodeJS.Timeout | null>(null);
  const repeater = React.useRef<NodeJS.Timeout | null>(null);
  const clearAll = () => {
    if (timer.current) clearTimeout(timer.current);
    // @ts-ignore
    if (repeater.current) clearInterval(repeater.current);
    timer.current = null; repeater.current = null;
  };
  return (
    <Pressable
      onPress={() => { onStep(); Haptics.selectionAsync().catch(() => {}); }}
      onPressIn={() => {
        // @ts-ignore
        timer.current = setTimeout(() => {
          onStep(); Haptics.selectionAsync().catch(() => {});
          // @ts-ignore
          repeater.current = setInterval(() => { onStep(); Haptics.selectionAsync().catch(() => {}); }, interval);
        }, delay);
      }}
      onPressOut={clearAll}
      onTouchEnd={clearAll}
      style={{ position: "absolute" }}
    >
      {children}
    </Pressable>
  );
}

export default function WeightScale({
  value, onChange,
  min = DEFAULTS.min, max = DEFAULTS.max, step = DEFAULTS.step,
  itemWidth = DEFAULTS.itemWidth, glassWidth = DEFAULTS.glassWidth, glassHeight = DEFAULTS.glassHeight,
  showReadout = true,
}: Props) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const count = Math.round((max - min) / step) + 1;
  const data = useMemo(() => Array.from({ length: count }, (_, i) => Number((min + i * step).toFixed(1))), [count, min, step]);

  const listRef = useRef<FlatList<number>>(null);
  const [panelW, setPanelW] = useState<number>(glassWidth);

  const idxFor = useCallback((v: number) => Math.round((clamp(v) - min) / step), [min, step]);
  const offsetFor = useCallback((v: number) => idxFor(v) * itemWidth, [idxFor, itemWidth]);

  const scrollToValue = useCallback((v: number, animated = true) => {
    listRef.current?.scrollToOffset({ offset: offsetFor(v), animated });
  }, [offsetFor]);

  const onMomentumEnd = (x: number) => {
    const idx = Math.round(x / itemWidth);
    const targetX = idx * itemWidth;

    if (Platform.OS === "android" && Math.abs(targetX - x) > 0.5) {
      listRef.current?.scrollToOffset({ offset: targetX, animated: false });
    }

    const v = clamp(min + idx * step);
    if (v !== value) {
      onChange(v);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  useEffect(() => {
    const id = setTimeout(() => scrollToValue(value, false), 0);
    return () => clearTimeout(id);
  }, [panelW]); // reposiciona cuando conoce ancho real

  const stepDown = () => scrollToValue(clamp(value - step));
  const stepUp = () => scrollToValue(clamp(value + step));

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      {showReadout && (
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 36, fontFamily: "Poppins-SemiBold", color: "#111827" }}>
            {value.toFixed(1)}<Text style={{ fontSize: 14, fontFamily: "Poppins-Regular", color: "#6B7280" }}> kg</Text>
          </Text>
        </View>
      )}

      <View
        onLayout={(e) => setPanelW(e.nativeEvent.layout.width || glassWidth)}
        style={{
          width: "100%",
          maxWidth: glassWidth,
          height: glassHeight,
          borderRadius: 18,
          backgroundColor: "rgba(255,255,255,0.96)",
          borderWidth: 1, borderColor: "#E5E7EB",
          overflow: "hidden",
          alignItems: "center", justifyContent: "center",
        }}
      >
        {/* brillo y fades */}
        <LinearGradient colors={["rgba(255,255,255,0.9)","rgba(255,255,255,0)"]} style={{ position:"absolute", top:0, left:0, right:0, height:22 }} />
        <LinearGradient colors={["#FFFFFF","rgba(255,255,255,0)"]} style={{ position:"absolute", left:0, top:0, bottom:0, width:40, zIndex:2 }} />
        <LinearGradient colors={["rgba(255,255,255,0)","#FFFFFF"]} style={{ position:"absolute", right:0, top:0, bottom:0, width:40, zIndex:2 }} />

        {/* aguja */}
        <View style={{ position:"absolute", top:24, bottom:24, left:"50%", width:3, marginLeft:-1.5, backgroundColor:"#2FCCAC", borderRadius:3, zIndex:3 }} />
        <View style={{ position:"absolute", bottom:22, left:"50%", marginLeft:-8, width:16, height:16, borderRadius:8, backgroundColor:"#2FCCAC", zIndex:3 }} />

        {/* ruler */}
        <FlatList
          ref={listRef}
          data={data}
          horizontal
          keyExtractor={(v) => String(v)}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({ length: itemWidth, offset: itemWidth * index, index })}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: Math.max(0, (panelW - itemWidth) / 2) }}
          onScrollEndDrag={(e) => onMomentumEnd(e.nativeEvent.contentOffset.x)}
          onMomentumScrollEnd={(e) => onMomentumEnd(e.nativeEvent.contentOffset.x)}
          renderItem={({ item }) => {
            const isInt = Math.abs(item * 10 - Math.round(item * 10)) < 0.0001 && Math.round(item * 10) % 10 === 0;
            const isFive = isInt && Math.round(item) % 5 === 0;
            const lineH = isFive ? 28 : isInt ? 18 : 10;
            const lineColor = isFive ? "#94A3B8" : "#CBD5E1";
            return (
              <View style={{ width: itemWidth, height: glassHeight, alignItems: "center", justifyContent: "center" }}>
                <View style={{ position: "absolute", top: 40, left: itemWidth / 2 - 1, width: 2, height: lineH, backgroundColor: lineColor, borderRadius: 2 }} />
                {isFive && (
                  <Text
                    style={{
                      position: "absolute", top: 40 + lineH + 6, left: 0, right: 0, textAlign: "center",
                      fontSize: 12, color: "#6B7280", fontVariant: ["tabular-nums"], fontFamily: "Poppins-Regular",
                    }}
                    allowFontScaling={false}
                  >
                    {Math.round(item)}
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>

      {/* zonas de toque invisibles */}
      <AutoRepeatPressable onStep={stepDown}>
        <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 100 }} />
      </AutoRepeatPressable>
      <AutoRepeatPressable onStep={stepUp}>
        <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 100 }} />
      </AutoRepeatPressable>
    </View>
  );
}
