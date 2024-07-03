// import React in our code
import React, { useState, useEffect } from 'react';

// import all the components we are going to use
import {
  SafeAreaView,
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform
} from 'react-native';

// import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Axios for API call
import axios from 'axios';
// import Icon for cross icon
import Icon from 'react-native-vector-icons/Ionicons';

const App = () => {
  // State for textarea value and API response
  const [textareaValue, setTextareaValue] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load history from AsyncStorage when the app loads
    loadHistory();
  }, []);

  const handleApiCall = async () => {
    if (textareaValue) {
      setLoading(true); // Set loading state to true
      try {
        const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCQJoGMfySOEoxEpS49DKO2vjKGSJ3GDxQ', {
          contents: [{ parts: [{ text: textareaValue }] }]
        });
        const apiResult = response.data.candidates[0].content.parts[0].text;
        setApiResponse(apiResult);
        setTextareaValue('');
        // Save the response in AsyncStorage
        await saveToHistory(apiResult);
      } catch (error) {
        console.error(error);
        alert('Error making API call: ' + error.message);
      } finally {
        setLoading(false); // Set loading state to false
      }
    } else {
      alert('Please fill in the textarea');
    }
  };

  const saveToHistory = async (data) => {
    try {
      // Get the current history
      const history = await AsyncStorage.getItem('api_history');
      const historyArray = history ? JSON.parse(history) : [];
      // Add the new data to history
      historyArray.push(data);
      // Save the updated history back to AsyncStorage
      await AsyncStorage.setItem('api_history', JSON.stringify(historyArray));
      setHistory(historyArray); // Update state
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const loadHistory = async () => {
    try {
      // Get the history from AsyncStorage
      const history = await AsyncStorage.getItem('api_history');
      const historyArray = history ? JSON.parse(history) : [];
      setHistory(historyArray);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('api_history');
      setHistory([]);
      setApiResponse('');
      alert('History cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleAppExit = () => {
    Alert.alert(
      'Exit App',
      'Do you want to close the app?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Chat With Gemini AI</Text>
          <TouchableOpacity onPress={handleAppExit}>
            <Icon name="close-circle" size={30} color="#333" />
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="Enter text for API call"
          value={textareaValue}
          onChangeText={(data) => setTextareaValue(data)}
          underlineColorAndroid="transparent"
          style={styles.textareaStyle}
          multiline
        />
        <TouchableOpacity
          onPress={handleApiCall}
          style={styles.buttonStyle}
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonTextStyle}>SUBMIT</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.textStyle}>{apiResponse}</Text>
        <TouchableOpacity onPress={loadHistory} style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>HISTORY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={clearHistory}
          style={[styles.buttonStyle, { backgroundColor: 'red' }]}
        >
          <Text style={styles.buttonTextStyle}>CLEAR HISTORY</Text>
        </TouchableOpacity>
        {history.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>API Call History:</Text>
            {history.map((item, index) => (
              <Text key={index} style={styles.historyItem}>
                {item}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    color: '#333',
  },
  textStyle: {
    padding: 10,
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
  },
  buttonStyle: {
    fontSize: 16,
    backgroundColor: '#007bff',
    padding: 15,
    marginTop: 20,
    minWidth: 250,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonTextStyle: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textareaStyle: {
    textAlign: 'left',
    height: 120,
    width: '100%',
    borderWidth: 1,
    borderColor: '#007bff',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  historyContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  historyItem: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default App;
