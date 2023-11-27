import fhir.resources.patient as p
import fhir.resources.bundle as b
import json
import os
import pandas as pd

directory = '/Users/enoch/Downloads/fhir/'
file_paths = [os.path.join(directory, file) for file in os.listdir(directory) if file.endswith('.json')]

data_rows = []

for file_path in file_paths:
    with open(file_path, 'r') as file:
        data = json.load(file)

    marital_status_code = None
    value_income = None
    value_education = None
    value_employment = None

    entries = data.get('entry', [])

    for entry in entries:
        resource = entry.get('resource', {})
        
        # Check if the resource is a Patient
        if resource.get('resourceType') == 'Patient':
            marital_status = resource.get('maritalStatus', {})
            coding = marital_status.get('coding', [{}])[0]
            marital_status_code = coding.get('code')
        
        # Check if the resource is an Observation
        for component in resource.get('component', []):
            code = component.get('code', {}).get('coding', [{}])[0].get('code', '')
            
            # Check if the code matches LOINC codes
            if code == '63586-2':
                value_income = component.get('valueQuantity', {}).get('value')
            elif code == '82589-3':
                value_education = component.get('valueCodeableConcept', {}).get('coding', [{}])[0].get('display', '')
            elif code == '67875-5':
                value_employment = component.get('valueCodeableConcept', {}).get('coding', [{}])[0].get('display', '')

    data_rows.append({
        'MaritalStatus': marital_status_code,
        'Income': value_income,
        'Education': value_education,
        'Employment': value_employment
    })

result_df = pd.DataFrame(data_rows, columns = ['MaritalStatus', 'Income', 'Education', 'Employment'])
result_df_filtered = result_df.dropna()

### Now Use Clustering ###

from sklearn.cluster import KMeans


result_df_filtered.loc[result_df_filtered['Education'] == 'Less than high school degree', 'Education'] = 'L'
result_df_filtered.loc[result_df_filtered['Education'] == 'More than high school', 'Education'] = 'M'
result_df_filtered.loc[result_df_filtered['Education'] == 'High school diploma or GED', 'Education'] = 'H'
result_df_filtered.loc[result_df_filtered['Education'] == 'I choose not to answer this question', 'Education'] = 'U'

result_df_filtered.loc[result_df_filtered['Employment'] == 'Full-time work', 'Employment'] = 'F'
result_df_filtered.loc[result_df_filtered['Employment'] == 'Part-time or temporary work', 'Employment'] = 'P'
result_df_filtered.loc[result_df_filtered['Employment'] == 'Otherwise unemployed but not seeking work', 'Employment'] = 'N'
result_df_filtered.loc[result_df_filtered['Employment'] == 'Unemployed (finding)', 'Employment'] = 'N'
result_df_filtered.loc[result_df_filtered['Employment'] == 'I choose not to answer this question', 'Employment'] = 'U'

result_df_filtered = pd.get_dummies(result_df_filtered, columns=['MaritalStatus', 'Education', 'Employment'])


data_for_clustering = result_df_filtered

num_clusters = 3
kmeans = KMeans(n_clusters=num_clusters)

kmeans.fit(data_for_clustering)
cluster_labels = kmeans.labels_
result_df_filtered['Cluster'] = cluster_labels

print(result_df_filtered)
#cluster_counts = result_df_filtered['Cluster'].value_counts()

#print(cluster_counts)
result_df_filtered.to_csv('result_dataframe.csv', index=False)  # Save as CSV without row indices


### Now Train Classifier ###

from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Assuming 'result_df_filtered' contains your DataFrame with cluster labels in the 'Cluster' column

# Features (X) - Exclude the 'Cluster' column
X = result_df_filtered.drop('Cluster', axis=1)

# Target labels (y) - Only the 'Cluster' column
y = result_df_filtered['Cluster']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the Decision Tree Classifier
clf = DecisionTreeClassifier(random_state=42)

# Train the classifier
clf.fit(X_train, y_train)

# Predict on the test set
y_pred = clf.predict(X_test)

# Evaluate the classifier's performance
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy of the Decision Tree classifier: {accuracy}")

from joblib import dump
dump(clf, 'trained_model.joblib')