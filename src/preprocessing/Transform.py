"""Preprocesamiento UNICO, compartido entre entrenamiento e inferencia (guia: sec. 9)."""
from torchvision import transforms as T

MEAN = (0.485, 0.456, 0.406)
STD = (0.229, 0.224, 0.225)


def eval_transform(size: int = 224):
    return T.Compose([T.Resize((size, size)), T.ToTensor(), T.Normalize(MEAN, STD)])


def train_transform(size: int = 224):
    return T.Compose([
        T.Resize((size, size)), T.RandomHorizontalFlip(), T.RandomVerticalFlip(),
        T.RandomRotation(20), T.ColorJitter(0.1, 0.1, 0.1),
        T.ToTensor(), T.Normalize(MEAN, STD),
    ])