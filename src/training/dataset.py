from pathlib import Path

from PIL import Image
from torch.utils.data import Dataset


class SplitDataset(Dataset):
    def __init__(self, root, items, transform):
        self.root, self.items, self.transform = Path(root), items, transform

    def __len__(self):
        return len(self.items)

    def __getitem__(self, i):
        archivo, etiqueta = self.items[i]
        img = Image.open(self.root / archivo).convert("RGB")
        return self.transform(img), etiqueta