import { useSecureStore } from "@/hooks/use-local-storage";
import styled from "@emotion/native";
import { Controller, useForm } from "react-hook-form";
import { Text } from "react-native";

const Container = styled.View`
  display: flex;
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background-color: #ffffff;
  padding: 15px 20px;
  gap: 10px;
  width: 100%;
  elevation: 3;
`;

const Header = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const TaskFormContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  height: 40px;
`;

const TaskInput = styled.TextInput`
  flex: 1;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
`;

const AddButton = styled.TouchableOpacity`
  background-color: #000;
  height: 38px;
  border-radius: 6px;
  aspect-ratio: 1;
  justify-content: center;
  align-items: center;
`;

const TaskList = styled.ScrollView`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  height: 150px;
  overflow-y: auto;
`;

const TaskContainer = styled.View`
  background-color: #f9f9f9;
  padding: 5px 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 5px 0;
`;

const TaskText = styled.Text`
  font-size: 16px;
`;

const DeleteButton = styled.TouchableOpacity`
  padding: 5px;
  background-color: #ff4d4d;
  border-radius: 5px;
`;

const EmptyContainer = styled.View`
  justify-content: center;
  align-items: center;
  min-height: 150px;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  color: #888;
  text-align: center;
`;

export const TaskManager = () => {
  const { setValue, handleSubmit, control } = useForm();

  const [tasks, setTasks] = useSecureStore<string[]>("tasks", []);

  const handleDeleteTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  return (
    <Container>
      <Header>Wake-up Tasks</Header>
      <TaskList>
        {tasks.length === 0 ? (
          <EmptyContainer>
            <EmptyStateText>No tasks added yet</EmptyStateText>
          </EmptyContainer>
        ) : (
          tasks.map((task, index) => (
            <TaskContainer key={index}>
              <TaskText>{task}</TaskText>
              <DeleteButton onPress={() => handleDeleteTask(index)}>
                <Text style={{ color: "#fff" }}>x</Text>
              </DeleteButton>
            </TaskContainer>
          ))
        )}
      </TaskList>
      <TaskFormContainer>
        <Controller
          control={control}
          name="task"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TaskInput
              placeholder="Add a task..."
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <AddButton
          onPress={handleSubmit((data) => {
            const newTasks = [...tasks, data.task];
            setTasks(newTasks);
            setValue("task", "");
          })}
        >
          <Text style={{ color: "#fff", fontSize: 24 }}>+</Text>
        </AddButton>
      </TaskFormContainer>
    </Container>
  );
};
