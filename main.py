import numpy as np
from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation
from keras.optimizers import SGD
from sklearn.preprocessing import LabelEncoder
from keras.utils import to_categorical

X_train = np.array(['Tính tổng 2 và 3', 'Diện tích hình tròn là gì?', 'Công thức của nước', 'Lịch năm 2022'])
y_train = np.array(['Toán', 'Toán', 'Khoa học', 'Thời sự'])

# Đánh số các nhãn bằng số nguyên
from sklearn.preprocessing import LabelEncoder
label_encoder = LabelEncoder()
y_train = label_encoder.fit_transform(y_train)

# Mã hóa nhãn thành vector one-hot
from keras.utils import to_categorical
y_train = to_categorical(y_train)
# Mã hóa văn bản thành vector
from keras.preprocessing.text import Tokenizer
tokenizer = Tokenizer(num_words=1000)
tokenizer.fit_on_texts(X_train)
X_train = tokenizer.texts_to_matrix(X_train, mode='tfidf')

# Mã hóa nhãn thành các số nguyên
le = LabelEncoder()
le.fit(y_train)
y_train = le.transform(y_train)

# Mã hóa nhãn thành vector one-hot
y_train = to_categorical(y_train)

# Xây dựng mô hình mạng neuron nhiều tầng
model = Sequential()
model.add(Dense(512, input_shape=(1000,)))
model.add(Activation('relu'))
model.add(Dropout(0.5))
model.add(Dense(256))
model.add(Activation('relu'))
model.add(Dropout(0.5))
model.add(Dense(4))
model.add(Activation('softmax'))

# Tối ưu hóa mô hình với Stochastic Gradient Descent
sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)
model.compile(loss='categorical_crossentropy',
              optimizer=sgd,
              metrics=['accuracy'])

# Huấn luyện mô hình với 10 epochs
model.fit(X_train, y_train, epochs=10, batch_size=32)

# Dự đoán nhãn của câu hỏi mới
new_question = ['Diện tích hình chữ nhật là gì?']
new_question = tokenizer.texts_to_matrix(new_question, mode='tfidf')
predicted_label = model.predict_classes(new_question)
predicted_label = le.inverse_transform(predicted_label)
print(predicted_label)
