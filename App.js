import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { theme } from "./colors";
import { Fontisto } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const travel = () => setWorking(false);
  const work = () => setWorking(true);

  const onChangeText = ({ nativeEvent: { text }}) => setText(text);

  // to do list 가져오기
  const loadToDos = async (toSave) => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    // setToDos(JSON.parse(saved))
    saved !== null ? setToDos(JSON.parse(saved)) : null;
  };

  useEffect(() => {
    loadToDos();
  }, []);

  // to do list 추가
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos, [ Date.now() ]: { text, working },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  // to do list를 스토리지에 저장
  const saveToDos = async (toSave) => {
    const stringToDo = JSON.stringify(toSave);
    await AsyncStorage.setItem(STORAGE_KEY, stringToDo)
  };

  // to do list 삭제
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? theme.white : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? theme.white : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        value={text}
        style={styles.input}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        onChange={onChangeText}
        onSubmitEditing={addToDo}
        returnKeyType="done"
        autoCorrect={true} // 자동완성
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity
                onPress={() => deleteToDo(key)}
              >
                <Fontisto name="trash" size={20} color={theme.delete} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: theme.bg,
  },
  header: {
    marginTop: 100,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnText: {
    color: theme.white,
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    marginVertical: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: theme.white,
    borderRadius: 30,
    fontSize: 16,
  },
  toDo: {
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.grey,
    borderRadius: 15,
  },
  toDoText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "500",
  }
});
