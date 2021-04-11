import React, { Component } from 'react';
import {View, Text, StyleSheet,Image, TextInput, Dimensions,TouchableOpacity} from 'react-native';
import MapView from 'react-native-maps';
import Marker from './assets/mapmarker.png';
import BackImg from './assets/BackImg.png';
import SerachBottomScreen from './components/BottomSheet';
class Dashboard extends Component{
    constructor(props) {
        super(props);
        this.state = {
            from: null,
            to: null,
            region: null,
            address: null,
            historyAddress: null,
            fromS: true,
            searchOn: false,
            list: [],
            search: null,
            selectFromMap: true,
         
            startPoint: null,
            mapData: null,
         
            defaultRegion: {
                latitude: 28.7097,
                longitude: 77.0867,
                latitudeDelta: 0.00922,
                longitudeDelta: 0.00421,
          
            }
        };
    }
    _onRegionChange = () => {
        if (this.map && this.state.mapData && this.state.mapData.coordinates) {
            this.map.fitToCoordinates(this.state.mapData.coordinates, { edgePadding: { top: 100, right: 100, bottom: 800, left: 100 }, animated: true })
        }
    }
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
              console.log(this.state.list,'ss')
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
     
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.row}>
                    <Image source={BackImg} style={{paddingHorizontal:10,marginTop:10}}/>
                
                     <TextInput
                style={{   backgroundColor:'white',
                borderRadius:8,
                width:300,
                paddingHorizontal:10,
                marginLeft:20}}
                autoCorrect={false}
                value={
                  this.state.from ? this.state.from.slice(0, 40) + '...' : ''
                }
                placeholder="Your Current Location"
                onChangeText={data => {
                    data.length
                      ? this.setState({search: data})
                      : this.setState({search: null});
                    this._handleSearch();
                  }}
              />
                    </View>
                    <View style={styles.MapContainer}>
                    {
                        <MapView
                    ref={map => (this.map = map)}
                    style={styles.map}
                    loadingEnabled={true}
                    initialRegion={this.state.defaultRegion}
                    onRegionChangeComplete={() => this._onRegionChange()}
                >
                    
<MapView.Marker
                        coordinate={this.state.defaultRegion}
                    >
                        <Image source={Marker} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                    </MapView.Marker>
                    {this.state.mapData && <MapView.Polyline
                        coordinates={this.state.mapData.coordinates}
                        strokeWidth={3}
                        strokeColor="#2162ff"
                    />}
                    
                    {this.state.mapData && <MapView.Marker
                        coordinate={this.state.mapData.coordinates[0]}
                    >
                        <Image source={Marker} style={{ width: 48, height: 48, resizeMode: 'contain' }}></Image>
                    </MapView.Marker>}
                </MapView>}
                    </View>
            <View style={styles.bottomSheet}>
            <Text style={styles.bottomtext1}>
            Address details
                </Text>
                <Text style={styles.bottomtext2}>
                Enter or pinpoint your address on the map
                </Text>
                <Text style={[styles.bottomtext1,{marginVertical:10}]}>
                1st main 4th cross,Alkoos 1 Dubai street address or map details shown here
                </Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>
          
                
            
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
backgroundColor:'white',
flex:1,
    },
    row:{

      
        flexDirection:'row',
        backgroundColor:'#2787FF',
        paddingVertical:8,
        paddingHorizontal:15,
        paddingTop:15,
        // paddingBottom:40
        // borderBottomLeftRadius:10
        // justifyContent:'center'
    },
    MapContainer:{

    
        // borderTopLeftRadius:30,
 
    //   marginLeft:50
      
    },
    map:{
        width:Dimensions.get('window').width,
        height:Dimensions.get('window').height/1.8,
        borderTopLeftRadius:30,
        borderTopRightRadius:30,
        zIndex:10,

    
    },
    bottomSheet:{
      
        paddingTop:30,
        borderTopLeftRadius:30,
        borderTopRightRadius:30,
        zIndex:10,
backgroundColor:'white',
marginTop:-30,
paddingHorizontal:12
    },
    button:{
        backgroundColor:'#2787FF',
        marginHorizontal:20,
        borderRadius:10,
        marginVertical:10
    },
    buttonText:{
        textAlign:'center',
        color:'white',
        fontSize:16,
        fontWeight:'bold',
        paddingVertical:20
    },
    bottomtext1:{
        color:'#252525',
        fontSize:16,
        lineHeight:19,
        fontWeight:'normal'
    },
    bottomtext2:{
        color:'rgba(37, 37, 37, 0.6)',
        fontSize:14,
        paddingVertical:10
    }
})

export default Dashboard;