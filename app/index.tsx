import { ScrollList } from "@/components/scroll-list";
import { TaskManager } from "@/components/task-manager";
import { useAlarm } from "@/hooks/use-alarm";
import { useSecureStore } from "@/hooks/use-local-storage";
import styled from "@emotion/native";
import { useEffect, useState } from "react";
import { Switch, Text, TouchableOpacity } from "react-native";

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 15px;
`;

const Header = styled.Text`
  font-size: 24px;
  font-weight: bold;
`;

const TimePicker = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background-color: #ffffff;
  padding: 5px;
  gap: 10px;
  elevation: 3;
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
  width: 100%;
  display: flex;
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background-color: #ffffff;
  padding: 15px 10px;
  gap: 10px;
  elevation: 3;
`;

const DayPickerHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DayPickerHeaderText = styled.Text`
  font-size: 18px;
  margin: 0 10px;
  font-weight: bold;
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

type Alarm = {
  id: string;
  day: number;
  hour: number;
  minute: number;
};

export default function AlarmScreen() {
  const [alarms, setAlarms] = useSecureStore<Alarm[]>("alarms", []);

  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("AM");
  const [isEveryday, setIsEveryday] = useState<boolean>(true);

  const [selectedDays, setSelectedDays] = useState<{
    [key: number]: boolean;
  }>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
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

  const { scheduleAlarm, cancelAlarm, stopAlarm } = useAlarm();

  useEffect(() => {
    if (!isEnabled) {
      alarms.forEach((alarm) => cancelAlarm(alarm.id));
      setAlarms([]);
      return;
    }

    const hour24 =
      selectedPeriod === "PM" && selectedHour < 12
        ? selectedHour + 12
        : selectedPeriod === "AM" && selectedHour === 12
        ? 0
        : selectedHour;

    const daysToSchedule = isEveryday
      ? [0, 1, 2, 3, 4, 5, 6]
      : Object.keys(selectedDays)
          .filter((k) => selectedDays[parseInt(k)])
          .map((k) => parseInt(k));

    daysToSchedule.forEach((day) => {
      const alarmId = `alarm-${day}-${hour24}-${selectedMinute}`;
      if (!alarms.find((a) => a.id === alarmId)) {
        scheduleAlarm({ days: [day], hour: hour24, minute: selectedMinute });
        setAlarms([
          ...alarms,
          { id: alarmId, day, hour: hour24, minute: selectedMinute },
        ]);
      }
    });
  }, [
    isEnabled,
    selectedHour,
    selectedMinute,
    selectedPeriod,
    selectedDays,
    isEveryday,
  ]);

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
        <ToggleText>Enable Your Alarm</ToggleText>
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
      <TaskManager />
      <TouchableOpacity onPress={stopAlarm}>
        <Text>Stop Alarm Test</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => cancelAlarm()}>
        <Text>Cancel Alarm Test</Text>
      </TouchableOpacity>
    </Container>
  );
}
