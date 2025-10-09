export function getExerciseImage(exerciseName: string): string {
  const exerciseMap: Record<string, string> = {
    'Agachamento Livre': 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Leg Press 45°': 'https://images.pexels.com/photos/7289316/pexels-photo-7289316.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Cadeira Extensora': 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Cadeira Flexora': 'https://images.pexels.com/photos/7289316/pexels-photo-7289316.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Desenvolvimento com Halteres': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Elevação Lateral': 'https://images.pexels.com/photos/4058316/pexels-photo-4058316.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Supino Reto': 'https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Supino Inclinado': 'https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Crucifixo Inclinado': 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Tríceps Testa': 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Tríceps Corda': 'https://images.pexels.com/photos/4058316/pexels-photo-4058316.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Barra Fixa': 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Remada Curvada': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Pulldown': 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Rosca Direta': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Rosca Alternada': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&cs=tinysrgb&w=400',
  };

  return exerciseMap[exerciseName] || 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400';
}
