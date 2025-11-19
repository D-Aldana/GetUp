import { ScrollList } from "@/components/scroll-list";
import styled from "@emotion/native";
import { useEffect, useState } from "react";
import { Switch } from "react-native";

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Header = styled.Text`
  font-size: 24px;
  font-weight: bold;
`;

const TimePicker = styled.View`
  display: flex;
  flex-direction: row;
  margin: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const PickerColumn = styled.View`
  flex: 1;
  align-items: center;
`;

const ToggleContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ToggleText = styled.Text`
  font-size: 18px;
  margin-right: 10px;
`;

export default function AlarmScreen() {
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  useEffect(() => {
    if (isEnabled) {
      let hour = selectedHour;
      if (selectedPeriod === "PM" && hour < 12) {
        hour += 12;
      } else if (selectedPeriod === "AM" && hour === 12) {
        hour = 0;
      }
    } else {
      console.log("Alarm disabled");
    }
  }, [isEnabled, selectedHour, selectedMinute, selectedPeriod]);

  return (
    <Container>
      <Header>Get Up</Header>
      <TimePicker>
        <PickerColumn>
          <ScrollList
            items={Array.from({ length: 12 }, (_, i) => `${i + 1}`)}
            height={150}
            itemHeight={25}
            startIndex={selectedHour - 1}
            onActiveChange={(item) => setSelectedHour(parseInt(item))}
          />
        </PickerColumn>
        <PickerColumn>
          <ScrollList
            items={Array.from({ length: 60 }, (_, i) =>
              i < 10 ? `0${i}` : `${i}`
            )}
            height={150}
            itemHeight={25}
            startIndex={selectedMinute}
            onActiveChange={(item) => setSelectedMinute(parseInt(item))}
          />
        </PickerColumn>
        <PickerColumn>
          <ScrollList
            items={["AM", "PM"]}
            height={150}
            itemHeight={25}
            startIndex={selectedPeriod === "AM" ? 0 : 1}
            onActiveChange={(item) => setSelectedPeriod(item)}
          />
        </PickerColumn>
      </TimePicker>
      <ToggleContainer>
        <ToggleText>Enable Alarm</ToggleText>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={"#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </ToggleContainer>
    </Container>
  );
}
