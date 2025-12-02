import { useAlarm } from "@/hooks/use-alarm";
import { useSecureStore } from "@/hooks/use-local-storage";
import styled from "@emotion/native";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import { ThemedText } from "@/components/themed-text";

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const TaskListContainer = styled.View`
  width: 100%;
  max-height: 200px;
  margin-top: 20px;
`;

const TaskList = styled.ScrollView`
  gap: 16px;
  margin-top: 10px;
  height: 150px;
  overflow-y: auto;
`;

const TaskItem = styled.TouchableOpacity`
  background-color: #f9f9f9;
  padding: 5px 10px;
  border-radius: 5px;
  align-items: center;
  margin-bottom: 10px;
`;

const StopButton = styled.TouchableOpacity`
  margin-top: 20px;
  background-color: red;
  padding: 12px 22px;
  border-radius: 10px;
`;

const StopButtonText = styled(ThemedText)`
  color: white;
  font-weight: bold;
`;

export default function ModalScreen() {
  const [tasks, setTasks] = useSecureStore<string[]>("tasks", []);
  const { getState, stopAlarm } = useAlarm();
  const [tasksCompleted, setTasksCompleted] = useState<boolean[]>([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    setTasksCompleted(tasks.map(() => false));

    const checkAlarmState = async () => {
      const state = await getState();
      console.log("Alarm state in modal:", state);
    };

    checkAlarmState();
  }, [tasks]);

  const toggleTask = (index: number) => {
    const updated = [...tasksCompleted];
    updated[index] = !updated[index];
    setTasksCompleted(updated);

    setAllDone(updated.every((t) => t));
  };

  const handleStop = async () => {
    await stopAlarm();
    router.push("/");
  };

  return (
    <Container>
      <ThemedText type="title">Wake Up</ThemedText>

      <TaskListContainer>
        <TaskList>
          {tasks.map((task, index) => (
            <TaskItem
              key={index}
              onPress={() => toggleTask(index)}
              disabled={tasksCompleted[index]}
            >
              <ThemedText
                style={{
                  textDecorationLine: tasksCompleted[index]
                    ? "line-through"
                    : "none",
                }}
              >
                {task}
              </ThemedText>
            </TaskItem>
          ))}
        </TaskList>
      </TaskListContainer>

      {allDone && (
        <>
          <ThemedText type="subtitle" style={{ marginTop: 20 }}>
            All tasks completed!
          </ThemedText>

          <StopButton onPress={handleStop}>
            <StopButtonText>Stop Alarm</StopButtonText>
          </StopButton>
        </>
      )}
    </Container>
  );
}
