import { useLocalSearchParams } from 'expo-router';
import { GameScreen } from '../../screens/GameScreen';

export default function GameRoute() {
  const params = useLocalSearchParams<{ level: string }>();
  const levelId = Number(params.level);
  return <GameScreen levelId={Number.isFinite(levelId) ? levelId : 1} />;
}
