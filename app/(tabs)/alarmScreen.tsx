import { ScrollList } from "@/components/scroll-list";
import styled from "@emotion/native";
import { useState } from "react";

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Header = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
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

export default function AlarmScreen() {
  const [selectedHour, setSelectedHour] = useState("1");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  return (
    <Container>
      <Header>Alarm Screen</Header>
      <TimePicker>
        <PickerColumn>
          <ScrollList
            items={Array.from({ length: 12 }, (_, i) => `${i + 1}`)}
            height={150}
            itemHeight={25}
            startIndex={parseInt(selectedHour) - 1}
            onActiveChange={(item) => setSelectedHour(item)}
          />
        </PickerColumn>
        <PickerColumn>
          <ScrollList
            items={Array.from({ length: 60 }, (_, i) =>
              i < 10 ? `0${i}` : `${i}`
            )}
            height={150}
            itemHeight={25}
            startIndex={parseInt(selectedMinute)}
            onActiveChange={(item) => setSelectedMinute(item)}
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
    </Container>
  );
}
