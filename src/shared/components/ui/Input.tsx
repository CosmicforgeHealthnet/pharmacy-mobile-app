import { View, ViewStyle } from "react-native";
import { TextInput as PaperInput, Text } from "react-native-paper";
import { Colors } from "@/shared/constants/theme";
import { useColorScheme } from "@/shared/hooks/use-color-scheme";

interface InputProps {
   label?: string;
   error?: string;
   icon?: React.ReactNode;
   rightIcon?: React.ReactNode;
   onRightIconPress?: () => void;
   containerStyle?: ViewStyle;
   value?: string;
   onChangeText?: (text: string) => void;
   placeholder?: string;
   secureTextEntry?: boolean;
}

export function Input({
   label,
   error,
   icon,
   rightIcon,
   onRightIconPress,
   containerStyle,
   ...props
}: InputProps) {
   const colorScheme = useColorScheme();
   const colors = Colors[colorScheme ?? "light"];

   return (
      <View style={[{ marginBottom: 16 }, containerStyle]}>
         <PaperInput
            mode="outlined"
            label={label}
            error={!!error}
            value={props.value}
            onChangeText={props.onChangeText}
            placeholder={props.placeholder}
            secureTextEntry={props.secureTextEntry}
            theme={{
               colors: {
                  primary: colors.primary,
                  background: colors.inputBackground,
                  text: colors.text,
                  placeholder: colors.placeholder,
                  error: "#EF4444",
               },
            }}
            left={
               icon
                  ? <PaperInput.Icon icon={() => icon as any} />
                  : undefined
            }
            right={
               rightIcon
                  ? (
                     <PaperInput.Icon
                        icon={() => rightIcon as any}
                        onPress={onRightIconPress}
                     />
                  )
                  : undefined
            }
            style={{
               backgroundColor: colors.inputBackground,
            }}
            outlineColor="#E5E7EB"
            activeOutlineColor={colors.primary}
         />

         {error && (
            <Text style={{ color: "#EF4444", marginTop: 4, fontSize: 12 }}>
               {error}
            </Text>
         )}
      </View>
   );
}