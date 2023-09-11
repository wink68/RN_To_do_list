import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { theme } from "./colors";
import { Fontisto } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos";
const WORKING_STATE_KEY = "@workingState";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const travel = () => {
    setWorking(false);
    saveWorkingState(false);
  };
  
  const work = () => {
    setWorking(true);
    saveWorkingState(true);
  };

  const onChangeText = ({ nativeEvent: { text }}) => setText(text);

  // 항목 개수 계산
  const getProgress = () => {
    const filteredToDos = Object.values(toDos).filter((todo) => todo.working === working);
    const total = filteredToDos.length;
    const completed = filteredToDos.filter((todo) => todo.completed).length;
  
    return {
      total,
      completed,
      percentage: total === 0 ? 0 : Math.floor((completed / total) * 100),
    };
  };

  
  // 진행바
  const ProgressBar = () => {
    const { total, completed, percentage } = getProgress();

    // 너비 계산
    const screenWidth = Dimensions.get('window').width;
    const containerWidth = screenWidth * 0.75;
    const progressBarWidth = containerWidth * (percentage / 100);

    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ ...styles.progressBarContainer, width: containerWidth }}>
          <View style={{ ...styles.progress, width: progressBarWidth }} />
        </View>
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>
    );
  };


  // to do list 가져오기
  const loadToDos = async (toSave) => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    // setToDos(JSON.parse(saved))
    saved !== null ? setToDos(JSON.parse(saved)) : null;
  };

  useEffect(() => {
    loadToDos();
    loadWorkingState();
  }, []);

  // to do list 추가
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos, [ Date.now() ]: { text, working, completed: false },
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

  // 체크박스 함수
  const handleCheckbox = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  
  // working 상태를 저장하는 함수
  const saveWorkingState = async (state) => {
    try {
      await AsyncStorage.setItem(WORKING_STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  };
  
  // 저장된 working 상태를 불러오는 함수
  const loadWorkingState = async () => {
    try {
      const savedWorkingState = await AsyncStorage.getItem(WORKING_STATE_KEY);
      if (savedWorkingState !== null) {
        setWorking(JSON.parse(savedWorkingState));
      }
    } catch (e) {
      console.error(e);
    }
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

      {/* 진행바 */}
      <ProgressBar />
      
      {/* to do list */}
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <View style={styles.checkboxAndTextContainer}>
                <View style={styles.checkboxCon}>
                  <TouchableOpacity onPress={() => handleCheckbox(key)}>
                    <Fontisto name={toDos[key].completed ? "checkbox-active" : "checkbox-passive"} size={20} color={theme.white} />
                  </TouchableOpacity>
                  <Text style={[
                    styles.toDoText, 
                    toDos[key].completed && { 
                      textDecorationLine: 'line-through', 
                      color: theme.disableFont,
                    }
                  ]}>
                    {toDos[key].text}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={20} color={theme.delete} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
      <TextInput
        value={text}
        style={styles.input}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        onChange={onChangeText}
        onSubmitEditing={addToDo}
        returnKeyType="done"
        autoCorrect={true} // 자동완성
      />
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
  progressBarContainer: {
    height: 2,
    backgroundColor: "#3A3D40",
    alignItems: "center",
    marginVertical: 35,
    flexDirection: "row",
    borderRadius: 20,
  },
  progress: {
    height: 2,
    backgroundColor: "#F4F7FB",
    borderRadius: 20,
  },
  progressText: {
    marginLeft: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  toDo: {
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: 'wrap',
    backgroundColor: theme.grey,
    borderRadius: 15,
  },
  checkboxAndTextContainer: {
    flexDirection: "row",
    flex: 1,
    marginRight: 10,
  },
  toDoText: {
    marginLeft: 10,
    marginRight: 15,
    color: theme.ableFont,
    fontSize: 16,
    fontWeight: "500",
  },
  checkboxCon: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  input: {
    marginVertical: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: theme.white,
    borderRadius: 30,
    fontSize: 16,
  },
});
