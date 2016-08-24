import React, {Component} from 'react'
import {
  Alert,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  NavigatorIOS,
  RefreshControl,
  ListView,
  MapView,
  AsyncStorage,
} from 'react-native'

// This is the root view
var hohoho = React.createClass({
  render() {
    return (
      <NavigatorIOS
        initialRoute={{
          component: Login,
          title: "Login"
        }}
        style={{flex: 1}}/>
    );
  }
});

var Register = React.createClass({
  getInitialState(){
     return {
      username: '',
      password: ''
      }
  },

  next() {
    // console.log("USER PASSWORD", this.state.username, this.state.password)
    fetch('https://hohoho-backend.herokuapp.com/register', {
      headers: {
       "Content-Type": "application/json"
    },
    method: 'POST',
    body: JSON.stringify({
      username: this.state.username,
      password: this.state.password,
      })
    })
      .then((response) => response.json())
      .then((responseJson) => {
        /* do something with responseJson and go back to the Login view but
         * make sure to check for responseJson.success! */
         console.log("RESPONSE", responseJson)
         this.props.navigator.pop();
      })
      .catch((err) => {
        /* do something if there was an error with fetching */
        console.log('err in register')
    });
  },

  render() {
    return (
      <View style={styles.container}>
      <TextInput
        style={{height: 40}}
        placeholder="Enter your username"
        onChangeText={(text) => this.setState({username: text})}/>
       <TextInput
        style={{height: 40}}
        placeholder="Enter your password" secureTextEntry={true}
        onChangeText={(password) => this.setState({password: password})}/>
        <TouchableOpacity onPress={this.next} style={[styles.button, styles.buttonRed]}>
           <Text style={styles.buttonLabel}>Register</Text>
        </TouchableOpacity>
      </View>
    );
  }
});



var LoginPage = React.createClass({

  getInitialState(){
     return { message: ''}
  },
  messages(){
    this.props.navigator.push({
      component: Messages,
      title: 'Messages'

    })
  },

  componentDidMount() { //runs once when component is inserted/rendered on page
    AsyncStorage.getItem('user')
      .then(result => {
        var parsedResult = JSON.parse(result);
        var username = parsedResult.username;
        var password = parsedResult.password;
        this.setState(parsedResult); //can set result directly using parseResult
        if (username && password) {
          this.next()
          // return this.login(username, password)
          //   .then(resp => resp.json())
          //   .then(checkResponseAndGoToMainScreen);
        }
        // Don't really need an else clause, we don't do anything in this case.
      })
    },

  next() {

    fetch('https://hohoho-backend.herokuapp.com/login', {
      headers: {
       "Content-Type": "application/json"
    },
    method: 'POST',
    body: JSON.stringify({
      username: this.state.username,
      password: this.state.password,
      })
    })
      .then((response) => response.json())
      .then((responseJson) => {
        /* do something with responseJson and go back to the Login view but
         * make sure to check for responseJson.success! */
         AsyncStorage.setItem('user', JSON.stringify({
              username: this.state.username,
              password: this.state.password
         }))
       })
      .then(() =>{

         this.props.navigator.push({
          component: Users,
          title: "Users",
          rightButtonTitle: "Messages",
          onRightButtonPress: this.messages
         })

      })
      .catch((err) => {
        /* do something if there was an error with fetching */
      // this.setState({message : err})
      // console.log(err)
      this.setState({message: err})
    });
  },

  render() {
    return (
      <View style={styles.container}>
      <Text>{this.state.message}</Text>

      <TextInput
        style={{height: 40}}
        placeholder="Enter your username"
        onChangeText={(text) => this.setState({username: text})}
        value={this.state.username}/>
       <TextInput
        style={{height: 40}}
        placeholder="Enter your password" secureTextEntry={true} //save the password
        onChangeText={(password) => this.setState({password: password})}
        value={this.state.password}/>
        <TouchableOpacity onPress={this.next} style={[styles.button, styles.buttonGreen]}>
           <Text style={styles.buttonLabel}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
});




var Users = React.createClass({
  getInitialState() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    fetch('https://hohoho-backend.herokuapp.com/users', {
       headers: {
       "Content-Type": "application/json"
       },
       method: 'GET'
       })
        .then((response) => response.json())
        .then((responseJson) => {
          // var arr = []
          // responseJson.users.forEach(function(user) {
          //   arr.push(user.username)
          // })
          console.log("RESPONSE.JSONNNNNNN", responseJson)
           this.setState({dataSource: ds.cloneWithRows(responseJson.users)});
          })
        .catch((err) => {
          /* do something if there was an error with fetching */
        // this.setState({message : err})
        // console.log(err)
        this.setState({message: err})
      });
      return {dataSource: ds.cloneWithRows([])} //this will gets returned empaty first before data gets put in later. asyncronous
    },

    sendLocation(user) {
        navigator.geolocation.getCurrentPosition(
            position => {
              this.setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
              console.log("Got position:", position);
              /* use fetch() with the received position here */
              fetch('https://hohoho-backend.herokuapp.com/messages', {
                  headers: {
                      "Content-Type": "application/json"
                  },
                  method: 'POST',
                  body: JSON.stringify({
                      to: user._id,
                      location: {
                          latitude: this.state.latitude,
                          longitude: this.state.longitude /* the received latitude from getCurrentPosition */
                      }
                    })
                  })
                  .then((response) => response.json())
                  .then((responseJson) => {

                      Alert.alert(
                          'Success',
                          'Your location has been sent' ,
                          [{text: 'Yay'}] // Button
                      )

                  })
                  .catch((err) => {
                      console.log('ERROR=====', err);
                      /* do something if there was an error with fetching */
                      // this.setState({message : err})
                      // console.log(err)
                      this.setState({message: err})
                  })
            },
            error => {Alert.alert(error.message)},
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        )

    },

  touchUser (user){
    fetch('https://hohoho-backend.herokuapp.com/messages', {
      headers: {
      "Content-Type": "application/json"
      },
      method: 'POST',
      body: JSON.stringify({
      to : user._id,
      })
      })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log("RESPONSE.JSONNNNNNN", responseJson)
            Alert.alert(
              'Success',
              'Your HoHoHo has been sent' ,
              [{text: 'Cool'}] // Button
            )
          })

        .catch((err) => {
          /* do something if there was an error with fetching */
        // this.setState({message : err})
        // console.log(err)
        this.setState({message: err})
      });
  },

  render(){
    return <View>
      <ListView
        dataSource={this.state.dataSource}
        renderRow={(rowData) => (
        <TouchableOpacity
          onPress={this.touchUser.bind(this, rowData)} //this is how you pass in data to functions s
          onLongPress={this.sendLocation.bind(this, rowData)}
          delayLongPress={2000}>
          <Text>{rowData.username}</Text>
        </TouchableOpacity>
        )}/>
      </View>
      }
  })


var Messages = React.createClass({
 getInitialState() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    fetch('https://hohoho-backend.herokuapp.com/messages', {
       headers: {
       "Content-Type": "application/json"
       },
       method: 'GET'
       })
        .then((response) => response.json())
        .then((responseJson) => {
          // var arr = []
          // responseJson.users.forEach(function(user) {
          //   arr.push(user.username)
          // })
          console.log("RESPONSEJSON GET MESSAGES", responseJson)
           this.setState({dataSource: ds.cloneWithRows(responseJson.messages)});
          })
        .catch((err) => {
          /* do something if there was an error with fetching */
        // this.setState({message : err})
        // console.log(err)
        this.setState({message: err})
      });
      return {
        dataSource: ds.cloneWithRows([]),
        refreshing: false,
      }
    },
    // constructor(props) {
    //   super(props);
    //   this.state = {
    //     refreshing: false,
    //   };
    // },

    _onRefresh() {
      this.setState({refreshing: true});
      fetch('https://hohoho-backend.herokuapp.com/messages', {
       headers: {
       "Content-Type": "application/json"
       },
       method: 'GET'
       })
        .then((response) => response.json())
        .then((responseJson) => {
          // var arr = []
          // responseJson.users.forEach(function(user) {
          //   arr.push(user.username)
          // })
           this.setState({dataSource: ds.cloneWithRows(responseJson.messages)});
          })
        .catch((err) => {
          /* do something if there was an error with fetching */
        // this.setState({message : err})
        // console.log(err)
        this.setState({message: err})
      }).then(() => {
        this.setState({refreshing: false});
      });
    },
     render(){
    return <View>
      <ListView refreshControl={
        <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}/>
    }
      dataSource={this.state.dataSource} renderRow={(rowData) =>
        <View>
          <Text>{rowData.from.username}</Text>
          <Text>{rowData.to.username}</Text>
          <Text>Message: Yo</Text>
          <Text>{rowData.timestamp}</Text>
          {(rowData.location && rowData.location.latitude ? <MapView
            showsUserLocation={true}
            scrollEnabled={false} //if the location exists, then <mapview> otherwise null 
            style={{height: 90}}
            region={{
              longitude: rowData.location.longitude,
              latitude: rowData.location.latitude,
              longitudeDelta: .1,
              latitudeDelta: .1
            }}
            annotations={[{
              latitude: rowData.location.latitude,
              longitude: rowData.location.longitude,
              title: "Atlantis Strip Club"
            }]}/>: null)}
        </View>

      }/>
      </View>
      }

})

var Login = React.createClass({
  getInitialState(){
    return {
      username: "",
      password: "",
    }
  },

  register() {
    this.props.navigator.push({
      component: Register,
      title: "Register"
    });
  },
  login() {
    this.props.navigator.push({
      component: LoginPage,
      title: "Login"
    });
  },

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.textBig}>Login to HoHoHo!</Text>
        <TouchableOpacity onPress={this.login} style={[styles.button, styles.buttonGreen]}>
          <Text style={styles.buttonLabel}>Tap to Login</Text>
        </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={this.register}>
          <Text style={styles.buttonLabel}>Tap to Register</Text>
        </TouchableOpacity>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  containerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  textBig: {
    fontSize: 36,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5,
  },
  buttonRed: {
    backgroundColor: '#FF585B',
  },
  buttonBlue: {
    backgroundColor: '#0074D9',
  },
  buttonGreen: {
    backgroundColor: '#2ECC40'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  }
});



AppRegistry.registerComponent('hohoho', () => hohoho );
