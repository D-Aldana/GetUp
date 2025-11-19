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

const DayPicker = styled.View`
  display: flex;
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background-color: #ffffff;
  padding: 20px 10px;
  gap: 10px;
`;

const DayPickerHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DayPickerHeaderText = styled.Text`
  font-size: 18px;
  margin: 0 10px;
`;

const DayToggle = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  background-color: ${(props: { selected: boolean }) =>
    props.selected ? "#81b0ff" : "#f0f0f0"};
`;

const DaysToggleContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 10px;
`;

const DayToggleText = styled.Text`
  font-size: 16px;
  color: ${(props: { selected: boolean }) =>
    props.selected ? "#ffffff" : "#000000"};
`;

export default function AlarmScreen() {
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");
  const [isEveryday, setIsEveryday] = useState<boolean>(false);

  const [selectedDays, setSelectedDays] = useState<{
    [key: number]: boolean;
  }>({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const toggleEveryday = () => {
    setIsEveryday((prev) => {
      const newValue = !prev;
      const updatedDays = {
        0: newValue,
        1: newValue,
        2: newValue,
        3: newValue,
        4: newValue,
        5: newValue,
        6: newValue,
      };
      setSelectedDays(updatedDays);
      return newValue;
    });
  };

  useEffect(() => {
    if (isEnabled) {
      let hour = selectedHour;
      if (selectedPeriod === "PM" && hour < 12) {
        hour += 12;
      } else if (selectedPeriod === "AM" && hour === 12) {
        hour = 0;
      }

      console.log(
        `Alarm set for ${hour}:${
          selectedMinute < 10 ? "0" : ""
        }${selectedMinute}`
      );
      console.log(
        "Repeats on days:",
        Object.entries(selectedDays)
          .filter(([_, v]) => v)
          .map(([k, _]) => k)
      );
    } else {
      console.log("Alarm disabled");
    }
  }, [isEnabled, selectedHour, selectedMinute, selectedPeriod, selectedDays]);

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
      <DayPicker>
        <DayPickerHeader>
          <DayPickerHeaderText>Repeat</DayPickerHeaderText>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={"#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleEveryday}
            value={isEveryday}
          />
        </DayPickerHeader>
        <DaysToggleContainer>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <DayToggle
              key={index}
              selected={selectedDays[index]}
              onPress={() => {
                setSelectedDays((prev) => ({
                  ...prev,
                  [index]: !prev[index],
                }));
              }}
            >
              <DayToggleText selected={selectedDays[index]}>
                {day}
              </DayToggleText>
            </DayToggle>
          ))}
        </DaysToggleContainer>
      </DayPicker>
    </Container>
  );
}
