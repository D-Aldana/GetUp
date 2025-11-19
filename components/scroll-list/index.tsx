import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface Props {
  items: string[];
  height?: number;
  itemHeight?: number;
  onActiveChange?: (item: string, index: number) => void;
  repeat?: boolean;
  startIndex?: number;
}

export const ScrollList: React.FC<Props> = ({
  items,
  height = 300,
  itemHeight = 50,
  repeat = false,
  startIndex = 0,
  onActiveChange,
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<Animated.FlatList<string>>(null);
  const [data, setData] = useState<string[]>([]);

  const mod = (n: number, m: number) => ((n % m) + m) % m;

  useEffect(() => {
    if (repeat) {
      const MULTIPLIER = 200;
      setData(Array(MULTIPLIER).fill(items).flat());
    } else {
      setData(items);
    }
  }, [items, repeat]);

  // Start in middle for infinite loop
  useEffect(() => {
    if (data.length === 0) return;

    const mid = repeat ? Math.floor(data.length / 2) : 0;
    const target = mid + startIndex;

    listRef.current?.scrollToOffset({
      offset: target * itemHeight,
      animated: false,
    });
  }, [data]);

  // -------------------------------
  // 🧲 CUSTOM SNAPPING (smooth)
  // -------------------------------
  const snapTo = (offset: number) => {
    const index = Math.round(offset / itemHeight);
    listRef.current?.scrollToOffset({
      offset: index * itemHeight,
      animated: true,
    });

    const realIndex = repeat ? mod(index, items.length) : index;
    onActiveChange?.(items[realIndex], realIndex);
  };

  const handleScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;

    // Allow a tiny delay so momentum can finish
    setTimeout(() => {
      snapTo(offset);
    }, 50);
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    snapTo(offset);
  };

  const renderItem = ({ item, index }: any) => {
    const inputRange = [
      (index - 1) * itemHeight,
      index * itemHeight,
      (index + 1) * itemHeight,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.8, 1.4, 0.8],
      extrapolate: "clamp",
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.item,
          { height: itemHeight, transform: [{ scale }], opacity },
        ]}
      >
        <Text style={styles.text}>{item}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={["white", "transparent"]}
        style={[styles.mask, { top: 0, height: itemHeight * 2 }]}
      />

      <Animated.FlatList
        ref={listRef}
        data={data}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: height / 2 - itemHeight / 2,
        }}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
      />

      <LinearGradient
        colors={["transparent", "white"]}
        style={[styles.mask, { bottom: 0, height: itemHeight * 2 }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    width: "100%",
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "800",
    textTransform: "uppercase",
    fontSize: 18,
  },
  mask: {
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
});
