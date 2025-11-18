import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ListRenderItemInfo,
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
    if (!repeat) {
      setData(items);
      return;
    }

    const REPEAT_COUNT = 200;
    const buffer = Array(REPEAT_COUNT).fill(items).flat();
    setData(buffer);
  }, [items, repeat]);

  useEffect(() => {
    if (data.length === 0) return;

    const middle = repeat ? Math.floor(data.length / 2) : 0;
    const targetIndex = middle + startIndex;

    listRef.current?.scrollToOffset({
      offset: targetIndex * itemHeight,
      animated: false,
    });
  }, [data, startIndex, repeat, itemHeight]);

  const handleSnap = (e: any) => {
    const offset = e.nativeEvent.contentOffset.y;
    const index = Math.round(offset / itemHeight);

    listRef.current?.scrollToOffset({
      offset: index * itemHeight,
      animated: true,
    });
  };

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const index = Math.round(value / itemHeight);
      const actualIndex = repeat ? mod(index, items.length) : index;

      if (onActiveChange && items[actualIndex]) {
        onActiveChange(items[actualIndex], actualIndex);
      }
    });

    return () => scrollY.removeListener(listener);
  }, [items, repeat, itemHeight, onActiveChange]);

  const renderItem = ({ item, index }: ListRenderItemInfo<string>) => {
    const inputRange = [
      (index - 1) * itemHeight,
      index * itemHeight,
      (index + 1) * itemHeight,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.8, 1.5, 0.8],
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
        style={[styles.topMask, { height: itemHeight * 2 }]}
      />

      <Animated.FlatList
        ref={listRef}
        data={data}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleSnap}
        contentContainerStyle={{
          paddingVertical: height / 2 - itemHeight / 2,
        }}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />

      <LinearGradient
        colors={["transparent", "white"]}
        style={[styles.bottomMask, { height: itemHeight * 2 }]}
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
  topMask: {
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
  bottomMask: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 10,
  },
});
