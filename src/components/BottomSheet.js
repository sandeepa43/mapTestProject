import React from 'react';
import {
  FlatList,
  StatusBar,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  Platform,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import {
  withNavigation,
  StackActions,
  NavigationActions,
} from 'react-navigation';
// import store from 'react-native-simple-store';
import {debounce} from 'lodash';
import mapmarker from '../assets/mapmarker.png';
import placeholder from '../assets/BackImg.png';
import back from '../assets/BackImg.png';
var counter = false;
var countTime = 0;

class SerachBottomScreen extends React.Component {
  constructor(props) {
    super(props);
    this._handleSearchDebounce = debounce(this._handleSearch, 500);
    this.state = {
      from: null,
      to: null,
      address: null,
      historyAddress: null,
      fromS: true,
      searchOn: false,
      list: [],
      search: null,
      selectFromMap: true,
    };
  }
  componentDidUpdate() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this._handleBackPress,
    );
    if (counter == false && this.state.selectFromMap) {
      fetch(
        'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
          this.props.locData.latitude +
          ',' +
          this.props.locData.longitude +
          '&key=AIzaSyBEI1_r_jnKjXLe65ApJiyBp_G1Fd3Ok_U',
      )
        .then(res => res.json())
        .then(responce => {
          if (responce.results[0]) {
            var address = responce.results[0].formatted_address;
            if (!this.state.fromS) {
              this.setState({to: address}, () => {
                // store.save('endPoint', this.props.locData);
              });
            } else {
              this.setState({from: address}, () => {
                // store.save('startPoint', this.props.locData);
              });
            }
            counter = true;
            setTimeout(() => {
              counter = false;
            }, 1000);
            this.setState({
              address: responce.results[0].formatted_address,
              historyAddress: responce.results[0].formatted_address,
            });
          }
        });
    }
  }
  componentWillUnmount() {
    if (this.backHandler) this.backHandler.remove();
  }
  _handleBackPress = () => {
    if (this.state.searchOn) {
      this.setState({searchOn: false}, () => {
        return true;
      });
    } else {
      if (countTime > 0) {
        BackHandler.exitApp();
        return true;
      } else {
        countTime++;
        setTimeout(() => {
          countTime = 0;
        }, 5000);
        ToastAndroid.showWithGravity(
          'Press again to exit!',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
        return true;
      }

      // this.props.navigation.pop();
    }
  };
  _handleSearch() {
    if (this.state.search !== null) {
      fetch(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' +
          this.state.search +
          '&components=country:in&location=' +
          this.props.locData.latitude +
          ',' +
          this.props.locData.longitude +
          '&radius=5000&key=AIzaSyBEI1_r_jnKjXLe65ApJiyBp_G1Fd3Ok_U',
      )
        .then(res => res.json())
        .then(responce => {
          this.setState({list: []});
          for (let index = 0; index < responce.predictions.length; index++) {
            this.setState({
              list: [
                ...this.state.list,
                {
                  main:
                    responce.predictions[index].structured_formatting.main_text,
                  secondary:
                    responce.predictions[index].structured_formatting
                      .secondary_text,
                  key: responce.predictions[index].place_id,
                },
              ],
            });
          }
        });
    } else {
      this.setState({search: null, list: []});
    }
  }
  _handleListClick(placeid, placename) {
    fetch(
      'https://maps.googleapis.com/maps/api/geocode/json?place_id=' +
        placeid +
        '&key=AIzaSyBEI1_r_jnKjXLe65ApJiyBp_G1Fd3Ok_U',
    )
      .then(res => res.json())
      .then(responce => {
        if (
          responce.results[0] &&
          responce.results[0].geometry &&
          responce.results[0].geometry.location
        ) {
          this.setState({
            list: [],
            search: null,
          });
          var address =
            placename.split(',')[0] +
            (placename.split(',')[1] == undefined
              ? ''
              : ',' + placename.split(',')[1]) +
            (placename.split(',')[2] == undefined
              ? ''
              : ',' + placename.split(',')[2]);

          const location = {
            latitude: responce.results[0].geometry.location.lat,
            longitude: responce.results[0].geometry.location.lng,
          };
        //   this.state.fromS
        //     ? store.save('startPoint', location).then(
        //         this.setState({from: address}, () => {
        //           this.setState({searchOn: false}, () => {
        //             this.setState({selectFromMap: true}, () => {
        //               this.props.parentRegionChange(location);
        //             });
        //           });
        //         }),
        //       )
        //     : store.save('endPoint', location).then(
        //         this.setState({to: address}, () => {
        //           this.setState({searchOn: false}, () => {
        //             this.setState({selectFromMap: true}, () => {
        //               this.props.parentRegionChange(location);
        //             });
        //           });
        //         }),
        //       );
        }
      });
  }
  render() {
    return (
      <View>
        {!this.state.searchOn && (
          <View style={styles.bottomScreenParent}>
            <View>
              <View style={styles.dot} />
              <TextInput
                style={styles.inputBox}
                autoCorrect={false}
                value={
                  this.state.from ? this.state.from.slice(0, 40) + '...' : ''
                }
                placeholder="Your Current Location"
                onTouchStart={() => {
                  this.setState({fromS: true}, () => {
                    this.setState({selectFromMap: false}, () => {
                      this.setState({searchOn: true});
                    });
                  });
                }}
              />
            </View>
            <View>
              <View style={styles.dot2} />
              <TextInput
                value={this.state.to ? this.state.to.slice(0, 40) + '...' : ''}
                style={styles.inputBox}
                autoCorrect={false}
                numberOfLines={1}
                placeholder="Enter Destination"
                onTouchStart={() => {
                  this.setState({fromS: false}, () => {
                    this.setState({selectFromMap: false}, () => {
                      this.setState({searchOn: true});
                    });
                  });
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.findNow}
              onPress={() => {
                this.state.to
                  ? this.props.parentReference('FindRideScreen')
                  : Alert.alert(
                      'Hello User :)',
                      'Do you want us to take you any where otherwise select your destination',
                    );
              }}>
              <Text style={{textAlign: 'center', color: '#fff'}}>Search</Text>
            </TouchableOpacity>
          </View>
        )}
        {this.state.searchOn && (
          <View style={styles2.ssParent}>
            {Platform.Version > 25 && (
              <StatusBar backgroundColor="lightgrey" barStyle="light-content" />
            )}
            <TouchableOpacity
              style={styles2.backBtnParent}
              onPressIn={() => {
                this.setState({searchOn: false});
              }}>
              <Image source={back} style={styles2.backBtn} />
            </TouchableOpacity>
            <TextInput
              autoFocus
              style={styles2.searchInput}
              placeholder="Search Location"
              onChangeText={data => {
                data.length
                  ? this.setState({search: data})
                  : this.setState({search: null});
                this._handleSearchDebounce();
              }}
            />
            <View style={styles2.fromMap}>
              <Image style={styles2.sideLogo} source={map} />
              <TouchableOpacity
                style={{width: '100%'}}
                onPressIn={() => {
                  this.setState({searchOn: false, selectFromMap: true});
                }}>
                <Text style={styles2.listItem}>Select From Map</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              keyboardShouldPersistTaps="always"
              style={styles2.listParent}
              data={this.state.list}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles2.itemParent}
                  onPress={() => {
                    this._handleListClick(item.key, item.main);
                  }}>
                  <Image style={styles2.sideLogo} source={placeholder} />
                  <View style={{width: '100%', marginLeft: 10}}>
                    <Text>{item.main}</Text>
                    <Text
                      numberOfLines={1}
                      style={{width: '85%', color: 'grey'}}>
                      {item.secondary}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dot2: {
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: '#FE2C2C',
    position: 'absolute',
    left: '13.5%',
    top: '43.5%',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: '#41CF88',
    position: 'absolute',
    left: '13.5%',
    top: '43.5%',
  },
  bottomScreenParent: {
    paddingTop: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowRadius: 20,
    shadowOpacity: 1,
    backgroundColor: '#fff',
  },
  inputBox: {
    height: 50,
    borderWidth: 1,
    borderRadius: 3,
    width: '80%',
    marginVertical: 10,
    alignSelf: 'center',
    paddingLeft: 40,
  },
  findNow: {
    width: '80%',
    height: 50,
    backgroundColor: '#41CF88',
    borderRadius: 3,
    alignSelf: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
});
const styles2 = StyleSheet.create({
  ssParent: {
    width: '100%',
    height: '100%',
    zIndex: 999,
    elevation: 1000,
    backgroundColor: 'white',
  },
  backBtnParent: {
    position: 'absolute',
    top: 0,
    left: 0,
    elevation: 5,
    backgroundColor: '#fff',
    height: 50,
    width: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  fromMap: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignContent: 'center',
    borderBottomWidth: 0.2,
    borderBottomColor: 'lightgrey',
    paddingVertical: 10,
    paddingLeft: 20,
    marginTop: 60,
  },
  itemParent: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.2,
    borderBottomColor: 'lightgrey',
    paddingVertical: 10,
    paddingLeft: 20,
    // backgroundColor: 'green',
    height: 60,
  },
  sideLogo: {
    width: 24,
    height: 24,
    // backgroundColor:'green',
    resizeMode: 'contain',
  },
  searchInput: {
    fontSize: 18,
    position: 'absolute',
    top: 0,
    width: '100%',
    borderColor: 'black',
    elevation: 5,
    zIndex: 0,
    height: 50,
    backgroundColor: 'white',
    marginLeft: 50,
  },
  listParent: {
    width: '100%',
    marginBottom: '10%',
  },
  listItem: {
    fontSize: 16,
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
});

export default SerachBottomScreen;
