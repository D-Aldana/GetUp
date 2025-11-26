import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
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
  startIndex?: number;
}

export const ScrollList: React.FC<Props> = ({
  items,
  height = 300,
  itemHeight = 50,
  startIndex = 0,
  onActiveChange,
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    if (items.length === 0) return;

    listRef.current?.scrollToOffset({
      offset: startIndex * itemHeight,
      animated: false,
    });

    onActiveChange?.(items[startIndex], startIndex);
  }, [items, itemHeight, startIndex]);

  const snapTo = useCallback(
    (offset: number) => {
      const index = Math.round(offset / itemHeight);
      listRef.current?.scrollToOffset({
        offset: index * itemHeight,
        animated: true,
      });

      onActiveChange?.(items[index], index);
    },
    [items, itemHeight, onActiveChange]
  );

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    snapTo(offset);
  };

  // Memoized item renderer
  const RenderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
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
    },
    [scrollY, itemHeight]
  );

  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={["white", "transparent"]}
        style={[styles.mask, { top: 0, height: itemHeight * 2 }]}
        pointerEvents="none"
      />

      <Animated.FlatList
        ref={listRef}
        data={items}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: height / 2 - itemHeight / 2,
        }}
        renderItem={RenderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        removeClippedSubviews={true}
      />

      <LinearGradient
        colors={["transparent", "white"]}
        style={[styles.mask, { bottom: 0, height: itemHeight * 2 }]}
        pointerEvents="none"
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
