
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ImageBackground, Alert, ActionSheetIOS } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useFamily } from '@/contexts/FamilyContext';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const HOME_BACKGROUND_KEY = '@flow_fam_home_background';
const HOME_BACKGROUND_SET_KEY = '@flow_fam_home_background_set';

export default function HomeScreen() {
  const router = useRouter();
  const { familyMembers, currentUser, setCurrentUser } = useFamily();
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(true);

  // Load background image and edit visibility on mount
  useEffect(() => {
    loadBackgroundSettings();
  }, []);

  const loadBackgroundSettings = async () => {
    try {
      const savedBackground = await AsyncStorage.getItem(HOME_BACKGROUND_KEY);
      const backgroundSet = await AsyncStorage.getItem(HOME_BACKGROUND_SET_KEY);
      
      console.log('Loading background settings:', { savedBackground, backgroundSet });
      
      if (savedBackground) {
        setBackgroundImage(savedBackground);
      }
      
      if (backgroundSet === 'true') {
        setEditVisible(false);
      }
    } catch (error) {
      console.error('Error loading background settings:', error);
    }
  };

  const saveBackgroundSettings = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem(HOME_BACKGROUND_KEY, imageUri);
      await AsyncStorage.setItem(HOME_BACKGROUND_SET_KEY, 'true');
      console.log('Background settings saved:', imageUri);
    } catch (error) {
      console.error('Error saving background settings:', error);
    }
  };

  const handlePickBackgroundImage = async () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Take Photo', 'Choose from Library'],
        cancelButtonIndex: 0,
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          await launchCamera();
        } else if (buttonIndex === 2) {
          await launchImageLibrary();
        }
      }
    );
  };

  const launchCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setBackgroundImage(imageUri);
      setEditVisible(false);
      await saveBackgroundSettings(imageUri);
    }
  };

  const launchImageLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Photo library permission is required to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setBackgroundImage(imageUri);
      setEditVisible(false);
      await saveBackgroundSettings(imageUri);
    }
  };

  function renderContent() {
    return (
      <View style={styles.contentWrapper}>
        {editVisible && (
          <TouchableOpacity
            style={styles.pencilButton}
            onPress={handlePickBackgroundImage}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        )}

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={[styles.welcomeTitle, !backgroundImage && styles.welcomeTitleNoBackground]}>
            Welcome to Flow Fam!
          </Text>

          <View style={styles.profileGrid}>
            {familyMembers.map((member, index) => {
              const fallbackLetter = member.name.charAt(0).toUpperCase();
              const isParent = member.role === 'parent';
              
              return (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.profileTile}
                    onPress={() => {
                      console.log('Selected member:', member.name);
                      setCurrentUser(member);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.profilePhotoContainer}>
                      {member.photoUri ? (
                        <Image source={{ uri: member.photoUri }} style={styles.profilePhoto} />
                      ) : (
                        <View style={styles.fallbackCircle}>
                          <Text style={styles.fallbackLetter}>{fallbackLetter}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.profileName}>{member.name}</Text>
                    <View style={styles.roleContainer}>
                      <IconSymbol
                        ios_icon_name={isParent ? 'person.2.fill' : 'person.fill'}
                        android_material_icon_name={isParent ? 'people' : 'person'}
                        size={14}
                        color="rgba(255, 255, 255, 0.9)"
                      />
                      <Text style={styles.roleText}>{isParent ? 'Parent' : 'Child'}</Text>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Main render
  return (
    <View style={[styles.container, { backgroundColor: backgroundImage ? 'transparent' : colors.background }]}>
      {backgroundImage ? (
        <ImageBackground
          source={{ uri: backgroundImage }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          {renderContent()}
        </ImageBackground>
      ) : (
        renderContent()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  contentWrapper: {
    flex: 1,
  },
  pencilButton: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 3,
    zIndex: 10,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 140,
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Poppins_700Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeTitleNoBackground: {
    color: colors.text,
    textShadowColor: 'transparent',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 10,
  },
  profileTile: {
    width: (screenWidth - 64) / 2,
    height: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.60)',
    borderRadius: 18,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  profilePhotoContainer: {
    marginBottom: 10,
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  fallbackCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackLetter: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Poppins_700Bold',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Nunito_400Regular',
  },
});
