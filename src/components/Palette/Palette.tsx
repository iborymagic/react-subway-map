import { Container, ColorOption } from './Palette.style';

interface PaletteProps {
  inputName: string;
  colors: {
    name: string;
    disabled: boolean;
  }[];
}

const Palette = ({ inputName, colors }: PaletteProps) => (
  <Container>
    {colors.map(({ disabled, name }) => (
      <label key={name}>
        <input name={inputName} type="radio" disabled={disabled} hidden />
        <ColorOption backgroundColor={name}></ColorOption>
      </label>
    ))}
  </Container>
);

export default Palette;
export type { PaletteProps };