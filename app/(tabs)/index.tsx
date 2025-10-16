import styled from '@emotion/native';
import Checkbox from '@react-native-community/checkbox';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { removeAlarm, scheduleAlarm, stopAlarm } from 'expo-alarm-module';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default function HomeScreen() {
  const [time, setTime] = useState<Date | null>(null);
  const [show, setShow] = useState(false);
  const [tasks, setTasks] = useState<string[]>([]);

  const { setValue, handleSubmit, control } = useForm();

  const addToList = (data: any) => {
    if (data && data.trim().length > 0) {
      setTasks([...tasks, data.trim()]);
    }
    setValue('task', '');
  };

  const setAlarm = async (localDate: Date) => {
    if (!localDate) return;

    const now = new Date();
    const trigger = new Date(now);
    trigger.setHours(localDate.getHours(), localDate.getMinutes(), 0, 0);

    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 1);
    }

    try {
      await scheduleAlarm({
        uid: 'alarm1',
        day: trigger,
        title: 'Wake Up!',
        showDismiss: true,
        showSnooze: true,
        snoozeInterval: 5,
        repeating: true,
        active: true,
      } as any);
    } catch (err) {
      console.error('Failed to schedule alarm', err);
    }
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const nativeEvent: any = event;
    if (Platform.OS === 'android') {
      setShow(false);
      if (nativeEvent?.type === 'dismissed') return;
    } else {
      setShow(true);
    }

    if (!selectedDate) return;

    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();

    const localDate = new Date();
    localDate.setHours(hours, minutes, 0, 0);

    setTime(localDate);
    setAlarm(localDate);
  };

  const cancelAlarm = async () => {
    setTime(null);
    try {
      await removeAlarm?.('alarm1');
    } catch (err) {
      try {
        await removeAlarm?.();
      } catch (e) {
        console.error('Failed to remove alarm', e);
      }
    }
  };

  const stopCurrentAlarm = async () => {
    try {
      await stopAlarm?.('alarm1');
    } catch (err) {
      try {
        await stopAlarm?.();
      } catch (e) {
        console.error('Failed to stop alarm', e);
      }
    }
  };

  return (
    <Container>
      {time && <Text>Alarm Time: {time.toLocaleTimeString()}</Text>}

      <TouchableOpacity onPress={() => setShow(true)}>
        <Text>Select Time</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={cancelAlarm}>
        <Text>Cancel Alarm</Text>
      </TouchableOpacity>

      <Controller
        control={control}
        name="task"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Example Input"
            style={{
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginBottom: 10,
              paddingHorizontal: 10,
            }}
          />
        )}
      />

      <TouchableOpacity onPress={handleSubmit((data) => addToList(data.task))}>
        <Text>Submit</Text>
      </TouchableOpacity>

      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Checkbox
              value={false}
              onValueChange={() => {
                const newTasks = [...tasks];
                newTasks.splice(index, 1);
                setTasks(newTasks);
              }}
            />
            <Text>{task}</Text>
          </View>
        ))
      ) : (
        <TouchableOpacity onPress={stopCurrentAlarm}>
          <Text>Stop Alarm</Text>
        </TouchableOpacity>
      )}

      {show && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onChange}
        />
      )}
    </Container>
  );
}